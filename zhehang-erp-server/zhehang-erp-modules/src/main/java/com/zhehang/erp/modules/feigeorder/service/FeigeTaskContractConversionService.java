package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeAccountingContractMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractChangeLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderOperationLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 将最终审批通过的飞哥任务转换为独立的代理记账合同。
 *
 * <p>本服务有意不依赖任务服务或 {@link FeigeOrderContractService}，避免订单桥接与任务审批
 * 之间形成 Bean 循环。订单行锁和数据库活动合同唯一键共同保证重复提交只生成一份合同。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeTaskContractConversionService {

    private static final Set<String> ACTIVE_CONTRACT_STATUSES = Set.of("draft", "executing");
    private static final Set<String> INVALID_ORDER_STATUSES = Set.of("rejected", "refunded", "cancelled");
    private static final DateTimeFormatter NUMBER_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final FeigeOrderMapper orderMapper;
    private final FeigeAccountingContractMapper contractMapper;
    private final FeigeContractChangeLogMapper contractChangeLogMapper;
    private final FeigeOrderOperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    /**
     * 最终任务审批同事务调用。只认当前登录租户中的真实订单和订单权威快照。
     * 已有草稿或履约中合同时直接返回其 ID，不重复写合同或审计日志。
     */
    @Transactional(rollbackFor = Exception.class)
    public Long ensureContractFromApprovedTask(Long orderId) {
        if (orderId == null) {
            throw new BusinessException(409, "合同转换必须关联飞哥订单");
        }
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long operatorId = SecurityUtils.getCurrentUserId();
        String operatorName = SecurityUtils.getCurrentUsername();
        if (tenantId == null || operatorId == null || !StringUtils.hasText(operatorName)) {
            throw new AccessDeniedException("当前登录身份缺少可信租户或操作人信息");
        }

        FeigeOrder order = orderMapper.selectOne(new LambdaQueryWrapper<FeigeOrder>()
                .eq(FeigeOrder::getId, orderId)
                .eq(FeigeOrder::getTenantId, tenantId)
                .last("FOR UPDATE"));
        if (order == null || !tenantId.equals(order.getTenantId())) {
            throw new BusinessException(404, "飞哥版订单不存在或不属于当前租户");
        }
        if (!"approved".equals(order.getAuditStatus())) {
            throw new BusinessException(409, "只有财务审核通过的飞哥订单才能转换合同");
        }
        if (INVALID_ORDER_STATUSES.contains(order.getStatus())) {
            throw new BusinessException(409, "当前订单状态不能转换合同");
        }

        FeigeAccountingContract existing = findActiveContract(orderId, tenantId);
        if (existing != null) {
            return existing.getId();
        }
        validateTrustedContractFields(order);

        FeigeAccountingContract contract = fromOrder(order, tenantId);
        try {
            if (contractMapper.insert(contract) <= 0 || contract.getId() == null) {
                throw new BusinessException("代理记账合同转换失败");
            }
        } catch (DuplicateKeyException duplicate) {
            FeigeAccountingContract concurrent = findActiveContract(orderId, tenantId);
            if (concurrent != null) {
                return concurrent.getId();
            }
            throw duplicate;
        }

        FeigeContractChangeLog contractLog = new FeigeContractChangeLog();
        contractLog.setContractId(contract.getId());
        contractLog.setChangeType("task_conversion");
        contractLog.setChangeDesc("任务最终审批通过后生成合同");
        contractLog.setOperatorId(operatorId);
        contractLog.setOperatorName(operatorName.trim());
        contractLog.setAfterData(snapshot(contract));
        contractLog.setTenantId(tenantId);
        if (contractChangeLogMapper.insert(contractLog) <= 0) {
            throw new BusinessException("合同已生成，但合同审计日志写入失败");
        }

        FeigeOrderOperationLog orderLog = new FeigeOrderOperationLog();
        orderLog.setOrderId(order.getId());
        orderLog.setOperationType("contract_convert_from_task");
        orderLog.setOperationDesc("任务最终审批通过后生成代理记账合同 " + contract.getContractNo());
        orderLog.setOperatorId(operatorId);
        orderLog.setOperatorName(operatorName.trim());
        orderLog.setRemarks("合同服务期限和服务人员待在合同台账补充");
        orderLog.setTenantId(tenantId);
        if (operationLogMapper.insert(orderLog) <= 0) {
            throw new BusinessException("合同已生成，但订单审计日志写入失败");
        }
        return contract.getId();
    }

    private void validateTrustedContractFields(FeigeOrder order) {
        if (!StringUtils.hasText(order.getCompanyName())) {
            throw new BusinessException(409, "订单缺少企业名称，不能转换合同");
        }
        if (order.getSalesmanId() == null) {
            throw new BusinessException(409, "订单缺少业务员ID，不能转换合同");
        }
        if (!StringUtils.hasText(order.getSalesmanName())) {
            throw new BusinessException(409, "订单缺少业务员姓名，不能转换合同");
        }
    }

    private FeigeAccountingContract findActiveContract(Long orderId, Long tenantId) {
        return contractMapper.selectOne(new LambdaQueryWrapper<FeigeAccountingContract>()
                .eq(FeigeAccountingContract::getOrderId, orderId)
                .eq(FeigeAccountingContract::getTenantId, tenantId)
                .in(FeigeAccountingContract::getContractStatus, ACTIVE_CONTRACT_STATUSES)
                .orderByDesc(FeigeAccountingContract::getId)
                .last("LIMIT 1"));
    }

    private FeigeAccountingContract fromOrder(FeigeOrder order, Long tenantId) {
        FeigeAccountingContract contract = new FeigeAccountingContract();
        contract.setContractNo(nextContractNo());
        contract.setOrderId(order.getId());
        contract.setOrderNo(order.getOrderNo());
        contract.setCompanyName(order.getCompanyName());
        contract.setSalesmanId(order.getSalesmanId());
        contract.setSalesmanName(order.getSalesmanName());
        contract.setDeptId(order.getDeptId());
        contract.setContractAmount(money(order.getContractAmount()));
        contract.setContractStatus("draft");
        contract.setLossFlag(0);
        contract.setBackupFlag(0);
        contract.setGiftMonth(0);
        contract.setEnterpriseNature(trimToNull(order.getCompanyNature()));
        contract.setPaidAmount(money(order.getReceivedAmount()));
        contract.setCustomerSource(trimToNull(order.getCustomerSource()));
        contract.setProductName(trimToNull(order.getBusinessType()));
        contract.setRenewalStatus("normal");
        contract.setTotalSpending(money(order.getContractAmount()));
        contract.setCustomerOrderCount(1);
        contract.setReferralCount(0);
        contract.setFollowupCount(0);
        contract.setCollectionCount(0);
        contract.setServiceMonths(0);
        contract.setWeworkGroupBound(0);
        contract.setTenantId(tenantId);
        return contract;
    }

    private String nextContractNo() {
        return "FGHT" + LocalDateTime.now().format(NUMBER_TIME)
                + ThreadLocalRandom.current().nextInt(10, 100);
    }

    private String snapshot(FeigeAccountingContract contract) {
        try {
            return objectMapper.writeValueAsString(contract);
        } catch (JsonProcessingException e) {
            throw new BusinessException("合同审计快照生成失败");
        }
    }

    private BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
