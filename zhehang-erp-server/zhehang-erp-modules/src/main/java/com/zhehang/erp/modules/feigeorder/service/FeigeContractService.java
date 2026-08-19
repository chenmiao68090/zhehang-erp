package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractHandoverRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRenewalRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractHandover;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractRenewal;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeAccountingContractMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractChangeLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractHandoverMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractRenewalMapper;
import com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.Owner;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.defaultText;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.displayName;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.money;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.monthsBetween;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.nextNo;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.optionalSuffix;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.ownerFromOrder;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.page;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.parseIds;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.safeInt;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.trimToNull;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.validateContract;

/**
 * 飞哥版代理记账合同域：合同建立（含随订单建立）、变更、续费、流失与恢复、服务人员交接。
 *
 * <p>“同一订单只允许一份草稿/履约中合同”的不变量由 assertNoOtherActiveContract 与数据库唯一键共同保证，
 * 所有写操作均落一条合同变更流水，形成可追溯审计链。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeContractService {

    private final FeigeAccountingContractMapper contractMapper;
    private final FeigeContractRenewalMapper contractRenewalMapper;
    private final FeigeContractChangeLogMapper contractChangeLogMapper;
    private final FeigeContractHandoverMapper contractHandoverMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeOrderSupport support;

    public IPage<FeigeAccountingContract> listContracts(int pageNum, int pageSize, String keyword,
                                                          String status, String view, Long staffId,
                                                          LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FeigeAccountingContract> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeAccountingContract::getSalesmanId,
                FeigeAccountingContract::getDeptId);
        query.eq(StringUtils.hasText(status), FeigeAccountingContract::getContractStatus, status);
        query.eq(staffId != null, FeigeAccountingContract::getServicePersonId, staffId)
                .ge(startDate != null, FeigeAccountingContract::getExpireDate, startDate)
                .le(endDate != null, FeigeAccountingContract::getExpireDate, endDate);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeAccountingContract::getCompanyName, keyword)
                    .or().like(FeigeAccountingContract::getContractNo, keyword)
                    .or().like(FeigeAccountingContract::getOrderNo, keyword));
        }
        if (StringUtils.hasText(view) && Set.of("normal", "currentRenewal", "t2OverdueRenewal", "t6ExpectedRenewal",
                "t3OverdueCustomer", "lossAudit", "lossCustomer").contains(view)) {
            query.eq(FeigeAccountingContract::getRenewalStatus, view);
        } else if ("expiring".equals(view)) {
            query.between(FeigeAccountingContract::getExpireDate, LocalDate.now(), LocalDate.now().plusDays(30))
                    .notIn(FeigeAccountingContract::getContractStatus, "completed", "terminated");
        } else if ("lost".equals(view)) {
            query.eq(FeigeAccountingContract::getLossFlag, 1);
        }
        query.orderByAsc(FeigeAccountingContract::getExpireDate)
                .orderByDesc(FeigeAccountingContract::getCreateTime);
        return contractMapper.selectPage(page(pageNum, pageSize), query);
    }

    public FeigeAccountingContract getContract(Long id) {
        return requireContract(id);
    }

    public List<FeigeContractRenewal> listContractRenewals(Long contractId) {
        requireContract(contractId);
        return contractRenewalMapper.selectList(new LambdaQueryWrapper<FeigeContractRenewal>()
                .eq(FeigeContractRenewal::getContractId, contractId)
                .orderByDesc(FeigeContractRenewal::getRenewalDate)
                .orderByDesc(FeigeContractRenewal::getCreateTime));
    }

    public List<FeigeContractChangeLog> listContractChanges(Long contractId) {
        requireContract(contractId);
        return contractChangeLogMapper.selectList(new LambdaQueryWrapper<FeigeContractChangeLog>()
                .eq(FeigeContractChangeLog::getContractId, contractId)
                .orderByDesc(FeigeContractChangeLog::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createContract(FeigeContractRequest request) {
        FeigeOrder order = request.getOrderId() == null ? null : support.requireOrder(request.getOrderId(), true);
        Owner owner = order != null ? ownerFromOrder(order) : support.resolveOwner(request.getSalesmanId());
        FeigeAccountingContract contract = new FeigeAccountingContract();
        applyContractFields(contract, request);
        contract.setContractNo(nextNo("FGHT"));
        contract.setOrderId(order == null ? null : order.getId());
        contract.setOrderNo(order == null ? null : order.getOrderNo());
        if (order != null) {
            contract.setCompanyName(order.getCompanyName());
            contract.setContractAmount(order.getContractAmount());
        }
        contract.setSalesmanId(owner.userId());
        contract.setSalesmanName(owner.name());
        contract.setDeptId(owner.deptId());
        contract.setContractStatus(defaultText(request.getContractStatus(),
                contract.getSignDate() == null ? "draft" : "executing"));
        contract.setRenewalStatus(defaultText(contract.getRenewalStatus(), "normal"));
        contract.setTotalSpending(money(contract.getContractAmount()));
        contract.setCustomerOrderCount(order == null ? 0 : 1);
        contract.setReferralCount(0);
        contract.setFollowupCount(0);
        contract.setCollectionCount(0);
        contract.setServiceMonths(monthsBetween(contract.getSignDate(), contract.getExpireDate()));
        contract.setWeworkGroupBound(0);
        validateContract(contract);
        contract.setServiceMonths(monthsBetween(contract.getSignDate(), contract.getExpireDate()));
        resolveServicePerson(contract);
        assertNoOtherActiveContract(contract);
        insertContractWithActiveInvariant(contract);
        logContractChange(contract, "create", "建立代理记账合同", null, contract);
        if (order != null) support.log(order.getId(), "contract_create", "创建代理记账合同 " + contract.getContractNo(), null);
        return contract.getId();
    }

    /**
     * 新单录入时勾选“同时建立合同”的入口，由 {@link FeigeOrderService#createOrder} 在同一事务内调用。
     */
    @Transactional(rollbackFor = Exception.class)
    public void createContractFromOrder(FeigeOrder order, FeigeOrderRequest request) {
        FeigeAccountingContract contract = new FeigeAccountingContract();
        contract.setContractNo(nextNo("FGHT"));
        contract.setOrderId(order.getId());
        contract.setOrderNo(order.getOrderNo());
        contract.setCompanyName(order.getCompanyName());
        contract.setSalesmanId(order.getSalesmanId());
        contract.setSalesmanName(order.getSalesmanName());
        contract.setDeptId(order.getDeptId());
        contract.setServicePersonId(order.getSalesmanId());
        contract.setServicePersonName(order.getSalesmanName());
        contract.setContractAmount(order.getContractAmount());
        contract.setSignDate(request.getContractSignDate());
        contract.setExpireDate(request.getContractExpireDate());
        contract.setContractStatus(contract.getSignDate() == null ? "draft" : "executing");
        contract.setLossFlag(0);
        contract.setBackupFlag(0);
        contract.setPayType(trimToNull(request.getContractPayType()));
        contract.setGiftMonth(request.getContractGiftMonth() == null ? 0 : Math.max(0, request.getContractGiftMonth()));
        contract.setEnterpriseNature(trimToNull(request.getEnterpriseNature()));
        contract.setPaidAmount(money(order.getReceivedAmount()));
        contract.setCustomerSource(order.getCustomerSource());
        contract.setProductName("代理记账服务");
        contract.setRenewalStatus("normal");
        contract.setTotalSpending(money(order.getContractAmount()));
        contract.setCustomerOrderCount(1);
        contract.setReferralCount(0);
        contract.setFollowupCount(0);
        contract.setCollectionCount(0);
        contract.setServiceMonths(monthsBetween(request.getContractSignDate(), request.getContractExpireDate()));
        contract.setWeworkGroupBound(0);
        validateContract(contract);
        insertContractWithActiveInvariant(contract);
        logContractChange(contract, "create", "随订单建立代理记账合同", null, contract);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateContract(Long id, FeigeContractRequest request) {
        FeigeAccountingContract contract = requireContract(id);
        FeigeAccountingContract before = support.snapshotContract(contract);
        applyContractFields(contract, request);
        if (request.getSalesmanId() != null && !Objects.equals(request.getSalesmanId(), contract.getSalesmanId())) {
            Owner owner = support.resolveOwner(request.getSalesmanId());
            contract.setSalesmanId(owner.userId());
            contract.setSalesmanName(owner.name());
            contract.setDeptId(owner.deptId());
        }
        validateContract(contract);
        resolveServicePerson(contract);
        assertNoOtherActiveContract(contract);
        updateContractWithActiveInvariant(contract);
        logContractChange(contract, "update", "更新合同与服务信息", before, contract);
        if (contract.getOrderId() != null) support.log(contract.getOrderId(), "contract_update", "修改代理记账合同 " + contract.getContractNo(), null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void terminateContract(Long id, String reason) {
        support.requireReviewer();
        if (!StringUtils.hasText(reason)) throw new BusinessException("请填写流失原因");
        FeigeAccountingContract contract = requireContract(id);
        FeigeAccountingContract before = support.snapshotContract(contract);
        contract.setContractStatus("terminated");
        contract.setLossFlag(1);
        contract.setLossReason(reason.trim());
        contract.setRenewalStatus("lossCustomer");
        contractMapper.updateById(contract);
        logContractChange(contract, "loss", "合同转为流失客户", before, contract);
        if (contract.getOrderId() != null) support.log(contract.getOrderId(), "contract_terminate", "终止代理记账合同 " + contract.getContractNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long renewContract(Long id, FeigeContractRenewalRequest request) {
        FeigeAccountingContract contract = requireContract(id);
        LocalDate start = request.getStartDate() != null ? request.getStartDate() : contract.getExpireDate();
        if (start != null && request.getExpireDate().isBefore(start)) {
            throw new BusinessException("续费截止日期不能早于续费开始日期");
        }
        FeigeAccountingContract before = support.snapshotContract(contract);
        FeigeContractRenewal renewal = new FeigeContractRenewal();
        renewal.setContractId(id);
        renewal.setRenewalDate(LocalDate.now());
        renewal.setStartDate(start);
        renewal.setExpireDate(request.getExpireDate());
        renewal.setAmount(money(request.getAmount()));
        renewal.setGiftMonth(request.getGiftMonth() == null ? 0 : Math.max(0, request.getGiftMonth()));
        renewal.setPayType(trimToNull(request.getPayType()));
        renewal.setOperatorId(SecurityUtils.getCurrentUserId());
        renewal.setOperatorName(support.resolveUserName(SecurityUtils.getCurrentUserId()));
        renewal.setRemark(trimToNull(request.getRemark()));
        contractRenewalMapper.insert(renewal);

        contract.setExpireDate(request.getExpireDate());
        contract.setContractStatus("executing");
        contract.setLossFlag(0);
        contract.setRenewalStatus("normal");
        contract.setCollectionCount(safeInt(contract.getCollectionCount()) + 1);
        contract.setTotalSpending(money(contract.getTotalSpending()).add(money(request.getAmount())));
        assertNoOtherActiveContract(contract);
        updateContractWithActiveInvariant(contract);
        logContractChange(contract, "renew", "登记合同续费 " + renewal.getAmount().toPlainString() + " 元",
                before, contract);
        return renewal.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void restoreContract(Long id, String reason) {
        support.requireReviewer();
        FeigeAccountingContract contract = requireContract(id);
        if (!Integer.valueOf(1).equals(contract.getLossFlag())
                && !"terminated".equals(contract.getContractStatus())) {
            throw new BusinessException("当前合同不是流失状态");
        }
        FeigeAccountingContract before = support.snapshotContract(contract);
        contract.setContractStatus("executing");
        contract.setLossFlag(0);
        contract.setLossReason(null);
        contract.setRenewalStatus("normal");
        assertNoOtherActiveContract(contract);
        updateContractWithActiveInvariant(contract);
        logContractChange(contract, "restore", "恢复正常服务" + optionalSuffix(reason), before, contract);
    }

    public List<FeigeAccountingContract> previewHandover(FeigeContractHandoverRequest request) {
        support.requireReviewer();
        support.resolveVisibleStaff(request.getTargetStaffId());
        LambdaQueryWrapper<FeigeAccountingContract> query = handoverQuery(request);
        query.orderByAsc(FeigeAccountingContract::getExpireDate);
        return contractMapper.selectList(query);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long handover(FeigeContractHandoverRequest request) {
        support.requireReviewer();
        SysUser target = support.resolveVisibleStaff(request.getTargetStaffId());
        SysUser source = request.getSourceStaffId() == null ? null : support.resolveVisibleStaff(request.getSourceStaffId());
        List<FeigeAccountingContract> contracts = contractMapper.selectList(handoverQuery(request));
        if (contracts.isEmpty()) throw new BusinessException("没有可交接的合同");
        String ids = contracts.stream().map(item -> String.valueOf(item.getId())).collect(Collectors.joining(","));
        for (FeigeAccountingContract contract : contracts) {
            FeigeAccountingContract before = support.snapshotContract(contract);
            applyHandoverStaff(contract, request.getServiceRole(), target);
            contractMapper.updateById(contract);
            logContractChange(contract, "handover", request.getServiceRole() + "交接给" + displayName(target),
                    before, contract);
        }
        FeigeContractHandover handover = new FeigeContractHandover();
        handover.setSourceStaffId(source == null ? null : source.getId());
        handover.setSourceStaffName(source == null ? "未指定" : displayName(source));
        handover.setTargetStaffId(target.getId());
        handover.setTargetStaffName(displayName(target));
        handover.setServiceRole(request.getServiceRole());
        handover.setContractCount(contracts.size());
        handover.setAffectedContractIds(ids);
        handover.setStatus("completed");
        handover.setOperatorId(SecurityUtils.getCurrentUserId());
        handover.setOperatorName(support.resolveUserName(SecurityUtils.getCurrentUserId()));
        contractHandoverMapper.insert(handover);
        return handover.getId();
    }

    public List<FeigeContractHandover> listHandoverHistory() {
        support.requireReviewer();
        return contractHandoverMapper.selectList(new LambdaQueryWrapper<FeigeContractHandover>()
                .orderByDesc(FeigeContractHandover::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public void revokeHandover(Long id) {
        support.requireReviewer();
        FeigeContractHandover handover = contractHandoverMapper.selectOne(
                new LambdaQueryWrapper<FeigeContractHandover>().eq(FeigeContractHandover::getId, id).last("FOR UPDATE"));
        if (handover == null) throw new BusinessException("交接记录不存在");
        if (!"completed".equals(handover.getStatus())) throw new BusinessException("该交接已撤销");
        if (handover.getSourceStaffId() == null) throw new BusinessException("未指定原服务人员的交接不能自动撤销");
        SysUser source = support.resolveVisibleStaff(handover.getSourceStaffId());
        for (Long contractId : parseIds(handover.getAffectedContractIds())) {
            FeigeAccountingContract contract = requireContract(contractId);
            if (!roleStaffMatches(contract, handover.getServiceRole(), handover.getTargetStaffId())) continue;
            FeigeAccountingContract before = support.snapshotContract(contract);
            applyHandoverStaff(contract, handover.getServiceRole(), source);
            contractMapper.updateById(contract);
            logContractChange(contract, "handover_revoke", "撤销服务人员交接", before, contract);
        }
        handover.setStatus("revoked");
        handover.setRevokedTime(LocalDateTime.now());
        contractHandoverMapper.updateById(handover);
    }

    private void applyContractFields(FeigeAccountingContract contract, FeigeContractRequest request) {
        contract.setCompanyName(request.getCompanyName().trim());
        contract.setServicePersonId(request.getServicePersonId());
        contract.setServiceStaffJson(trimToNull(request.getServiceStaffJson()));
        contract.setContractAmount(money(request.getContractAmount()));
        contract.setSignDate(request.getSignDate());
        contract.setExpireDate(request.getExpireDate());
        if (StringUtils.hasText(request.getContractStatus())) contract.setContractStatus(request.getContractStatus());
        contract.setLossFlag(request.getLossFlag() == null ? 0 : (request.getLossFlag() == 1 ? 1 : 0));
        contract.setLossReason(trimToNull(request.getLossReason()));
        contract.setRetentionMeasure(trimToNull(request.getRetentionMeasure()));
        contract.setFinalDecision(trimToNull(request.getFinalDecision()));
        contract.setBackupFlag(request.getBackupFlag() == null ? 0 : (request.getBackupFlag() == 1 ? 1 : 0));
        contract.setRemarks(trimToNull(request.getRemarks()));
        contract.setPayType(trimToNull(request.getPayType()));
        contract.setGiftMonth(request.getGiftMonth() == null ? 0 : Math.max(0, request.getGiftMonth()));
        contract.setEnterpriseNature(trimToNull(request.getEnterpriseNature()));
        contract.setManualBusinessTag(trimToNull(request.getManualBusinessTag()));
        contract.setPaidAmount(money(request.getPaidAmount()));
        contract.setCustomerSource(trimToNull(request.getCustomerSource()));
        contract.setSignerName(trimToNull(request.getSignerName()));
        contract.setProductName(trimToNull(request.getProductName()));
        contract.setRenewalStatus(defaultText(request.getRenewalStatus(),
                defaultText(contract.getRenewalStatus(), "normal")));
        contract.setEnterpriseLevel(trimToNull(request.getEnterpriseLevel()));
        contract.setBusinessTag(trimToNull(request.getBusinessTag()));
        contract.setFinanceDirectorId(request.getFinanceDirectorId());
        contract.setFinanceAdvisorId(request.getFinanceAdvisorId());
        contract.setAccountantId(request.getAccountantId());
    }

    private void assertNoOtherActiveContract(FeigeAccountingContract contract) {
        if (contract.getOrderId() == null || !isActiveContractStatus(contract.getContractStatus())) {
            return;
        }
        support.requireOrder(contract.getOrderId(), true);
        if (findOtherActiveContract(contract.getOrderId(), contract.getId()) != null) {
            throw new BusinessException(409, "该订单已有草稿或履约中的代理记账合同");
        }
    }

    private void insertContractWithActiveInvariant(FeigeAccountingContract contract) {
        try {
            if (contractMapper.insert(contract) <= 0) {
                throw new BusinessException("代理记账合同创建失败");
            }
        } catch (DuplicateKeyException duplicate) {
            if (contract.getOrderId() != null && isActiveContractStatus(contract.getContractStatus())
                    && findOtherActiveContract(contract.getOrderId(), null) != null) {
                throw new BusinessException(409, "该订单已有草稿或履约中的代理记账合同");
            }
            throw duplicate;
        }
    }

    private void updateContractWithActiveInvariant(FeigeAccountingContract contract) {
        try {
            if (contractMapper.updateById(contract) <= 0) {
                throw new BusinessException(409, "合同已被修改，请刷新后重试");
            }
        } catch (DuplicateKeyException duplicate) {
            if (contract.getOrderId() != null && isActiveContractStatus(contract.getContractStatus())
                    && findOtherActiveContract(contract.getOrderId(), contract.getId()) != null) {
                throw new BusinessException(409, "该订单已有草稿或履约中的代理记账合同");
            }
            throw duplicate;
        }
    }

    private FeigeAccountingContract findOtherActiveContract(Long orderId, Long currentContractId) {
        return contractMapper.selectOne(new LambdaQueryWrapper<FeigeAccountingContract>()
                .eq(FeigeAccountingContract::getOrderId, orderId)
                .in(FeigeAccountingContract::getContractStatus, "draft", "executing")
                .ne(currentContractId != null, FeigeAccountingContract::getId, currentContractId)
                .last("LIMIT 1 FOR UPDATE"));
    }

    private boolean isActiveContractStatus(String status) {
        return Set.of("draft", "executing").contains(status);
    }

    private void resolveServicePerson(FeigeAccountingContract contract) {
        if (contract.getServicePersonId() == null) {
            contract.setServicePersonName(null);
            contract.setAccountantId(null);
            contract.setAccountantName(null);
        } else {
            SysUser user = support.resolveVisibleStaff(contract.getServicePersonId());
            contract.setServicePersonName(displayName(user));
            contract.setAccountantId(contract.getServicePersonId());
            contract.setAccountantName(contract.getServicePersonName());
        }
        contract.setFinanceDirectorName(support.resolveOptionalStaffName(contract.getFinanceDirectorId()));
        contract.setFinanceAdvisorName(support.resolveOptionalStaffName(contract.getFinanceAdvisorId()));
    }

    private LambdaQueryWrapper<FeigeAccountingContract> handoverQuery(FeigeContractHandoverRequest request) {
        validateHandoverRole(request.getServiceRole());
        LambdaQueryWrapper<FeigeAccountingContract> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeAccountingContract::getSalesmanId,
                FeigeAccountingContract::getDeptId);
        query.ne(FeigeAccountingContract::getContractStatus, "terminated");
        if (request.getSourceStaffId() != null) {
            switch (request.getServiceRole()) {
                case "财税主管" -> query.eq(FeigeAccountingContract::getFinanceDirectorId,
                        request.getSourceStaffId());
                case "财税顾问" -> query.eq(FeigeAccountingContract::getFinanceAdvisorId,
                        request.getSourceStaffId());
                case "主办会计" -> query.eq(FeigeAccountingContract::getAccountantId,
                        request.getSourceStaffId());
                default -> throw new BusinessException("不支持的服务角色");
            }
        }
        return query;
    }

    private void applyHandoverStaff(FeigeAccountingContract contract, String role, SysUser user) {
        validateHandoverRole(role);
        String name = displayName(user);
        switch (role) {
            case "财税主管" -> {
                contract.setFinanceDirectorId(user.getId());
                contract.setFinanceDirectorName(name);
            }
            case "财税顾问" -> {
                contract.setFinanceAdvisorId(user.getId());
                contract.setFinanceAdvisorName(name);
            }
            case "主办会计" -> {
                contract.setAccountantId(user.getId());
                contract.setAccountantName(name);
                contract.setServicePersonId(user.getId());
                contract.setServicePersonName(name);
            }
            default -> throw new BusinessException("不支持的服务角色");
        }
    }

    private boolean roleStaffMatches(FeigeAccountingContract contract, String role, Long userId) {
        return switch (role) {
            case "财税主管" -> Objects.equals(contract.getFinanceDirectorId(), userId);
            case "财税顾问" -> Objects.equals(contract.getFinanceAdvisorId(), userId);
            case "主办会计" -> Objects.equals(contract.getAccountantId(), userId);
            default -> false;
        };
    }

    private void validateHandoverRole(String role) {
        if (!Set.of("财税主管", "财税顾问", "主办会计").contains(role)) {
            throw new BusinessException("不支持的服务角色");
        }
    }

    private void logContractChange(FeigeAccountingContract contract, String type, String desc,
                                   FeigeAccountingContract before, FeigeAccountingContract after) {
        FeigeContractChangeLog row = new FeigeContractChangeLog();
        row.setContractId(contract.getId());
        row.setChangeType(type);
        row.setChangeDesc(desc);
        row.setOperatorId(SecurityUtils.getCurrentUserId());
        row.setOperatorName(support.resolveUserName(SecurityUtils.getCurrentUserId()));
        row.setBeforeData(support.writeJson(before));
        row.setAfterData(support.writeJson(after));
        contractChangeLogMapper.insert(row);
    }

    private FeigeAccountingContract requireContract(Long id) {
        FeigeAccountingContract contract = contractMapper.selectById(id);
        if (contract == null) throw new BusinessException("代理记账合同不存在");
        if (!dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的代理记账合同");
        }
        return contract;
    }
}
