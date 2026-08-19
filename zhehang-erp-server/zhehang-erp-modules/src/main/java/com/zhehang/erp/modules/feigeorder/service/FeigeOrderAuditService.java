package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderAuditRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_IN_PROGRESS;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_PENDING;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_REJECTED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.page;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.requireFinanceReviewer;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.trimToNull;

/**
 * 飞哥版订单审核域：待审列表、财务审核通过/驳回、直接确认进入办理。
 *
 * <p>只处理“待财务审核”这一段状态机，审核结果落库后同步订单流程步骤并投递任务桥接事件。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeOrderAuditService {

    private final FeigeOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeOrderSupport support;

    public IPage<FeigeOrder> listAuditOrders(int pageNum, int pageSize, String keyword,
                                              Long salesmanId, String auditStatus) {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        query.eq(salesmanId != null, FeigeOrder::getSalesmanId, salesmanId)
                .eq(StringUtils.hasText(auditStatus), FeigeOrder::getAuditStatus, auditStatus);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getCompanyName, keyword)
                    .or().like(FeigeOrder::getOrderNo, keyword));
        }
        query.orderByDesc(FeigeOrder::getCreateTime);
        IPage<FeigeOrder> page = orderMapper.selectPage(page(pageNum, pageSize), query);
        page.getRecords().forEach(FeigeOrderSupport::fillOutstanding);
        return page;
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditOrder(Long id, FeigeOrderAuditRequest request) {
        requireFinanceReviewer();
        FeigeOrder order = support.requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        boolean approved = "approved".equals(request.getResult());
        order.setAuditStatus(request.getResult());
        order.setAuditRemark(trimToNull(request.getRemark()));
        order.setAuditorId(SecurityUtils.getCurrentUserId());
        order.setAuditorName(support.resolveUserName(SecurityUtils.getCurrentUserId()));
        order.setAuditTime(LocalDateTime.now());
        order.setStatus(approved ? ORDER_IN_PROGRESS : ORDER_REJECTED);
        order.setFlowProgress(approved ? "40%" : "0%");
        order.setCurrentStep(approved ? "资料交接" : "审核驳回");
        order.setTaskStatus(approved ? "processing" : "rejected");
        orderMapper.updateById(order);
        support.updateStepAfterAudit(order, approved, request.getRemark());
        support.log(id, approved ? "audit_approve" : "audit_reject",
                approved ? "新单收银审核通过" : "新单收银审核驳回", request.getRemark());
        if (approved) {
            support.enqueueTaskBridge(order, FeigeOrderTaskBridgeService.FINANCE_APPROVED);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectOrder(Long id, String reason) {
        requireFinanceReviewer();
        if (!StringUtils.hasText(reason)) throw new BusinessException("请填写驳回原因");
        FeigeOrder order = support.requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        order.setStatus(ORDER_REJECTED);
        order.setAuditStatus("rejected");
        order.setAuditRemark(reason.trim());
        order.setAuditorId(SecurityUtils.getCurrentUserId());
        order.setAuditorName(support.resolveUserName(SecurityUtils.getCurrentUserId()));
        order.setAuditTime(LocalDateTime.now());
        order.setFlowProgress("0%");
        order.setCurrentStep("审核驳回");
        order.setTaskStatus("rejected");
        orderMapper.updateById(order);
        support.updateStepAfterAudit(order, false, reason);
        support.log(id, "reject", "订单已驳回", reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long id) {
        requireFinanceReviewer();
        FeigeOrder order = support.requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        Long auditorId = SecurityUtils.getCurrentUserId();
        order.setStatus(ORDER_IN_PROGRESS);
        order.setAuditStatus("approved");
        order.setAuditRemark(null);
        order.setAuditorId(auditorId);
        order.setAuditorName(support.resolveUserName(auditorId));
        order.setAuditTime(LocalDateTime.now());
        order.setFlowProgress("40%");
        order.setCurrentStep("资料交接");
        order.setTaskStatus("processing");
        orderMapper.updateById(order);
        support.updateStepAfterAudit(order, true, "订单确认进入办理");
        support.log(id, "confirm", "确认订单并进入办理", null);
        support.enqueueTaskBridge(order, FeigeOrderTaskBridgeService.FINANCE_APPROVED);
    }
}
