package com.zhehang.erp.modules.feigeorder.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractHandoverRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRenewalRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderAuditRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigePaymentRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeRefundRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractHandover;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractRenewal;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderPayment;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderRefund;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderStep;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractChangeLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractHandoverMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractRenewalMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeAccountingContractMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderOperationLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderPaymentMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderRefundMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderStepMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeigeOrderContractService {

    public static final String ORDER_PENDING = "pending";
    public static final String ORDER_IN_PROGRESS = "in_progress";
    public static final String ORDER_COMPLETED = "completed";
    public static final String ORDER_REFUND_PENDING = "refund_pending";
    public static final String ORDER_REFUNDED = "refunded";
    public static final String ORDER_CANCELLED = "cancelled";
    public static final String ORDER_REJECTED = "rejected";

    private static final String REFUND_PENDING = "pending";
    private static final String REFUND_APPROVED = "approved";
    private static final String REFUND_COMPLETED = "completed";
    private static final String REFUND_REJECTED = "rejected";
    private static final String BUSINESS_TYPE_SEAL = "seal";
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private final FeigeOrderMapper orderMapper;
    private final FeigeOrderPaymentMapper paymentMapper;
    private final FeigeOrderRefundMapper refundMapper;
    private final FeigeAccountingContractMapper contractMapper;
    private final FeigeOrderOperationLogMapper operationLogMapper;
    private final FeigeOrderStepMapper orderStepMapper;
    private final FeigeContractRenewalMapper contractRenewalMapper;
    private final FeigeContractChangeLogMapper contractChangeLogMapper;
    private final FeigeContractHandoverMapper contractHandoverMapper;
    private final DataScopeHelper dataScopeHelper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;
    private final ObjectMapper objectMapper;
    private final FeigeOrderTaskBridgeService orderTaskBridgeService;

    public Map<String, Object> dashboard() {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        List<FeigeOrder> orders = orderMapper.selectList(query);
        BigDecimal contractAmount = ZERO;
        BigDecimal receivedAmount = ZERO;
        long inProgress = 0;
        long completed = 0;
        long refunding = 0;
        for (FeigeOrder order : orders) {
            contractAmount = contractAmount.add(money(order.getContractAmount()));
            receivedAmount = receivedAmount.add(money(order.getReceivedAmount()));
            if (ORDER_IN_PROGRESS.equals(order.getStatus()) || ORDER_PENDING.equals(order.getStatus())) inProgress++;
            if (ORDER_COMPLETED.equals(order.getStatus())) completed++;
            if (ORDER_REFUND_PENDING.equals(order.getStatus())) refunding++;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", orders.size());
        result.put("inProgress", inProgress);
        result.put("completed", completed);
        result.put("refunding", refunding);
        result.put("contractAmount", contractAmount);
        result.put("receivedAmount", receivedAmount);
        result.put("outstandingAmount", nonNegative(contractAmount.subtract(receivedAmount)));
        return result;
    }

    public IPage<FeigeOrder> listOrders(int pageNum, int pageSize, String keyword, String status,
                                         String businessType, String customerSource, Long salesmanId,
                                         LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        applyOrderFilters(query, keyword, status, businessType, customerSource, salesmanId,
                startDate, endDate);
        query.orderByDesc(FeigeOrder::getOrderDate).orderByDesc(FeigeOrder::getCreateTime);
        IPage<FeigeOrder> page = orderMapper.selectPage(page(pageNum, pageSize), query);
        page.getRecords().forEach(this::fillOutstanding);
        return page;
    }

    public IPage<FeigeOrder> listUnreceived(int pageNum, int pageSize, String keyword, Long salesmanId) {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getCompanyName, keyword)
                    .or().like(FeigeOrder::getOrderNo, keyword)
                    .or().like(FeigeOrder::getContacts, keyword));
        }
        query.eq(salesmanId != null, FeigeOrder::getSalesmanId, salesmanId);
        query.apply("COALESCE(contract_amount, 0) > COALESCE(received_amount, 0)")
                .notIn(FeigeOrder::getStatus, ORDER_REFUNDED, ORDER_CANCELLED)
                .orderByDesc(FeigeOrder::getOrderDate)
                .orderByDesc(FeigeOrder::getCreateTime);
        IPage<FeigeOrder> page = orderMapper.selectPage(page(pageNum, pageSize), query);
        page.getRecords().forEach(this::fillOutstanding);
        return page;
    }

    public FeigeOrder getOrder(Long id) {
        FeigeOrder order = requireOrder(id, false);
        fillOutstanding(order);
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(FeigeOrderRequest request) {
        rejectSealOrderCreation(request);
        Owner owner = resolveOwner(request.getSalesmanId());
        FeigeOrder order = new FeigeOrder();
        applyOrderFields(order, request, true);
        order.setOrderNo(nextNo("FG"));
        order.setSalesmanId(owner.userId());
        order.setSalesmanName(owner.name());
        order.setDeptId(owner.deptId());
        if (owner.deptId() != null && !StringUtils.hasText(order.getTeamName())) {
            order.setTeamName(resolveDeptNames(List.of(owner.deptId())).get(owner.deptId()));
        }
        order.setStatus(ORDER_PENDING);
        order.setAuditStatus("pending");
        order.setFlowProgress("20%");
        order.setCurrentStep("财务审核");
        order.setTaskStatus("processing");
        validateOrderAmounts(order);
        orderMapper.insert(order);
        createDefaultOrderSteps(order);

        if (money(order.getReceivedAmount()).compareTo(ZERO) > 0) {
            FeigeOrderPayment opening = new FeigeOrderPayment();
            opening.setOrderId(order.getId());
            opening.setPaymentTime(order.getCollectionTime() != null ? order.getCollectionTime() : LocalDateTime.now());
            opening.setAmount(order.getReceivedAmount());
            opening.setPaymentMethod("opening");
            opening.setAccountNumber(order.getCollectionAccountNumber());
            opening.setStatus("confirmed");
            opening.setVoucher(order.getVoucher());
            opening.setRemarks("新单录入时登记的已收款");
            paymentMapper.insert(opening);
        }

        if (Boolean.TRUE.equals(request.getCreateContract())) {
            createContractFromOrder(order, request);
        }
        log(order.getId(), "create", "录入飞哥版订单", null);
        enqueueTaskBridge(order, FeigeOrderTaskBridgeService.ORDER_CREATED);
        return order.getId();
    }

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
        page.getRecords().forEach(this::fillOutstanding);
        return page;
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditOrder(Long id, FeigeOrderAuditRequest request) {
        requireFinanceReviewer();
        FeigeOrder order = requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        boolean approved = "approved".equals(request.getResult());
        order.setAuditStatus(request.getResult());
        order.setAuditRemark(trimToNull(request.getRemark()));
        order.setAuditorId(SecurityUtils.getCurrentUserId());
        order.setAuditorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        order.setAuditTime(LocalDateTime.now());
        order.setStatus(approved ? ORDER_IN_PROGRESS : ORDER_REJECTED);
        order.setFlowProgress(approved ? "40%" : "0%");
        order.setCurrentStep(approved ? "资料交接" : "审核驳回");
        order.setTaskStatus(approved ? "processing" : "rejected");
        orderMapper.updateById(order);
        updateStepAfterAudit(order, approved, request.getRemark());
        log(id, approved ? "audit_approve" : "audit_reject",
                approved ? "新单收银审核通过" : "新单收银审核驳回", request.getRemark());
        if (approved) {
            enqueueTaskBridge(order, FeigeOrderTaskBridgeService.FINANCE_APPROVED);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectOrder(Long id, String reason) {
        requireFinanceReviewer();
        if (!StringUtils.hasText(reason)) throw new BusinessException("请填写驳回原因");
        FeigeOrder order = requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        order.setStatus(ORDER_REJECTED);
        order.setAuditStatus("rejected");
        order.setAuditRemark(reason.trim());
        order.setAuditorId(SecurityUtils.getCurrentUserId());
        order.setAuditorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        order.setAuditTime(LocalDateTime.now());
        order.setFlowProgress("0%");
        order.setCurrentStep("审核驳回");
        order.setTaskStatus("rejected");
        orderMapper.updateById(order);
        updateStepAfterAudit(order, false, reason);
        log(id, "reject", "订单已驳回", reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long id) {
        requireFinanceReviewer();
        FeigeOrder order = requireOrder(id, true);
        if (!"pending".equals(order.getAuditStatus()) || !ORDER_PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待财务审核的订单可以处理，请刷新后重试");
        }
        Long auditorId = SecurityUtils.getCurrentUserId();
        order.setStatus(ORDER_IN_PROGRESS);
        order.setAuditStatus("approved");
        order.setAuditRemark(null);
        order.setAuditorId(auditorId);
        order.setAuditorName(resolveUserName(auditorId));
        order.setAuditTime(LocalDateTime.now());
        order.setFlowProgress("40%");
        order.setCurrentStep("资料交接");
        order.setTaskStatus("processing");
        orderMapper.updateById(order);
        updateStepAfterAudit(order, true, "订单确认进入办理");
        log(id, "confirm", "确认订单并进入办理", null);
        enqueueTaskBridge(order, FeigeOrderTaskBridgeService.FINANCE_APPROVED);
    }

    public List<FeigeOrderStep> listOrderSteps(Long orderId) {
        FeigeOrder order = requireOrder(orderId, false);
        List<FeigeOrderStep> steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, orderId)
                .orderByAsc(FeigeOrderStep::getStepNo));
        return steps.isEmpty() ? syntheticOrderSteps(order) : steps;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(Long id, FeigeOrderRequest request) {
        FeigeOrder order = requireOrder(id, true);
        if (ORDER_REFUNDED.equals(order.getStatus()) || ORDER_CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不能修改");
        }
        if (isSealBusiness(order.getBusinessType()) != isSealBusiness(request.getBusinessType())) {
            throw new BusinessException(409, "刻章业务必须使用原刻章提单，不能与通用订单互转");
        }
        BigDecimal received = money(order.getReceivedAmount());
        applyOrderFields(order, request, false);
        order.setReceivedAmount(received);
        if (request.getSalesmanId() != null && !Objects.equals(request.getSalesmanId(), order.getSalesmanId())) {
            Owner owner = resolveOwner(request.getSalesmanId());
            order.setSalesmanId(owner.userId());
            order.setSalesmanName(owner.name());
            order.setDeptId(owner.deptId());
        }
        validateOrderAmounts(order);
        orderMapper.updateById(order);
        log(order.getId(), "update", "修改飞哥版订单", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(Long id) {
        FeigeOrder order = requireOrder(id, true);
        if (!"approved".equals(order.getAuditStatus()) || !ORDER_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("只有财务审核通过且办理中的订单才能完成");
        }
        order.setStatus(ORDER_COMPLETED);
        order.setFlowProgress("100%");
        order.setCurrentStep("已完成");
        order.setTaskStatus("completed");
        orderMapper.updateById(order);
        completeAllOrderSteps(order);
        log(id, "complete", "标记订单已完成", null);
    }

    public List<FeigeOrderPayment> listPayments(Long orderId) {
        requireOrder(orderId, false);
        return paymentMapper.selectList(new LambdaQueryWrapper<FeigeOrderPayment>()
                .eq(FeigeOrderPayment::getOrderId, orderId)
                .orderByDesc(FeigeOrderPayment::getPaymentTime)
                .orderByDesc(FeigeOrderPayment::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long addPayment(Long orderId, FeigePaymentRequest request) {
        FeigeOrder order = requireOrder(orderId, true);
        if (ORDER_REFUNDED.equals(order.getStatus()) || ORDER_CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("当前订单不能登记收款");
        }
        BigDecimal newReceived = money(order.getReceivedAmount()).add(money(request.getAmount()));
        if (newReceived.compareTo(money(order.getContractAmount())) > 0) {
            throw new BusinessException("本次收款后将超过合同金额");
        }
        FeigeOrderPayment payment = new FeigeOrderPayment();
        payment.setOrderId(orderId);
        payment.setPaymentTime(request.getPaymentTime() != null ? request.getPaymentTime() : LocalDateTime.now());
        payment.setAmount(money(request.getAmount()));
        payment.setPaymentMethod(defaultText(request.getPaymentMethod(), "other"));
        payment.setAccountNumber(request.getAccountNumber());
        payment.setStatus("confirmed");
        payment.setVoucher(request.getVoucher());
        payment.setRemarks(request.getRemarks());
        paymentMapper.insert(payment);
        order.setReceivedAmount(newReceived);
        order.setCollectionTime(payment.getPaymentTime());
        order.setCollectionAccountNumber(payment.getAccountNumber());
        orderMapper.updateById(order);
        log(orderId, "payment", "登记收款 " + money(request.getAmount()).toPlainString() + " 元", request.getRemarks());
        return payment.getId();
    }

    public List<FeigeOrderOperationLog> listLogs(Long orderId) {
        requireOrder(orderId, false);
        return operationLogMapper.selectList(new LambdaQueryWrapper<FeigeOrderOperationLog>()
                .eq(FeigeOrderOperationLog::getOrderId, orderId)
                .orderByDesc(FeigeOrderOperationLog::getCreateTime));
    }

    public IPage<FeigeOrderRefund> listRefunds(int pageNum, int pageSize, String keyword, String status,
                                                LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FeigeOrderRefund> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrderRefund::getSalesmanId, FeigeOrderRefund::getDeptId);
        query.eq(StringUtils.hasText(status), FeigeOrderRefund::getStatus, status);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrderRefund::getCompanyName, keyword)
                    .or().like(FeigeOrderRefund::getOrderNo, keyword));
        }
        query.ge(startDate != null, FeigeOrderRefund::getCreateTime,
                        startDate == null ? null : startDate.atStartOfDay())
                .lt(endDate != null, FeigeOrderRefund::getCreateTime,
                        endDate == null ? null : endDate.plusDays(1).atStartOfDay());
        query.orderByDesc(FeigeOrderRefund::getCreateTime);
        return refundMapper.selectPage(page(pageNum, pageSize), query);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long applyRefund(Long orderId, FeigeRefundRequest request) {
        FeigeOrder order = requireOrder(orderId, true);
        if (money(order.getReceivedAmount()).compareTo(ZERO) <= 0) {
            throw new BusinessException("该订单暂无可退实收金额");
        }
        Long active = refundMapper.selectCount(new LambdaQueryWrapper<FeigeOrderRefund>()
                .eq(FeigeOrderRefund::getOrderId, orderId)
                .in(FeigeOrderRefund::getStatus, REFUND_PENDING, REFUND_APPROVED));
        if (active != null && active > 0) {
            throw new BusinessException("该订单已有待处理退费申请");
        }
        // Completed refunds have already reduced received_amount, so the current balance is the source of truth.
        BigDecimal available = money(order.getReceivedAmount());
        if (money(request.getRefundAmount()).compareTo(available) > 0) {
            throw new BusinessException("退费金额超过当前可退金额");
        }
        FeigeOrderRefund refund = new FeigeOrderRefund();
        refund.setOrderId(orderId);
        refund.setOrderNo(order.getOrderNo());
        refund.setCompanyName(order.getCompanyName());
        refund.setRefundAmount(money(request.getRefundAmount()));
        refund.setReason(request.getReason());
        refund.setStatus(REFUND_PENDING);
        refund.setPreviousOrderStatus(order.getStatus());
        refund.setSalesmanId(order.getSalesmanId());
        refund.setSalesmanName(order.getSalesmanName());
        refund.setDeptId(order.getDeptId());
        refundMapper.insert(refund);
        order.setStatus(ORDER_REFUND_PENDING);
        orderMapper.updateById(order);
        log(orderId, "refund_apply", "提交退费申请 " + refund.getRefundAmount().toPlainString() + " 元", request.getReason());
        return refund.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        requireReviewer();
        if (!REFUND_PENDING.equals(refund.getStatus())) {
            throw new BusinessException("退费申请状态已变化，请刷新后重试");
        }
        fillReview(refund, REFUND_APPROVED, comment);
        refundMapper.updateById(refund);
        log(refund.getOrderId(), "refund_approve", "退费申请已审核", comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        requireReviewer();
        if (!REFUND_PENDING.equals(refund.getStatus()) && !REFUND_APPROVED.equals(refund.getStatus())) {
            throw new BusinessException("退费申请状态已变化，请刷新后重试");
        }
        fillReview(refund, REFUND_REJECTED, comment);
        refundMapper.updateById(refund);
        FeigeOrder order = requireOrder(refund.getOrderId(), true);
        order.setStatus(defaultText(refund.getPreviousOrderStatus(), ORDER_IN_PROGRESS));
        orderMapper.updateById(order);
        log(refund.getOrderId(), "refund_reject", "退费申请已驳回", comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        requireFinanceReviewer();
        if (!REFUND_APPROVED.equals(refund.getStatus())) {
            throw new BusinessException("退费申请尚未通过审核");
        }
        FeigeOrder order = requireOrder(refund.getOrderId(), true);
        BigDecimal remaining = money(order.getReceivedAmount()).subtract(money(refund.getRefundAmount()));
        if (remaining.compareTo(ZERO) < 0) {
            throw new BusinessException("订单实收金额已变化，无法完成退费");
        }
        refund.setStatus(REFUND_COMPLETED);
        refund.setCompletedTime(LocalDateTime.now());
        refund.setReviewComment(comment);
        refundMapper.updateById(refund);
        order.setReceivedAmount(remaining);
        order.setStatus(remaining.compareTo(ZERO) == 0
                ? ORDER_REFUNDED : defaultText(refund.getPreviousOrderStatus(), ORDER_IN_PROGRESS));
        orderMapper.updateById(order);
        log(refund.getOrderId(), "refund_complete", "完成退费 " + refund.getRefundAmount().toPlainString() + " 元", comment);
    }

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
        FeigeOrder order = request.getOrderId() == null ? null : requireOrder(request.getOrderId(), true);
        Owner owner = order != null ? ownerFromOrder(order) : resolveOwner(request.getSalesmanId());
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
        if (order != null) log(order.getId(), "contract_create", "创建代理记账合同 " + contract.getContractNo(), null);
        return contract.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateContract(Long id, FeigeContractRequest request) {
        FeigeAccountingContract contract = requireContract(id);
        FeigeAccountingContract before = snapshotContract(contract);
        applyContractFields(contract, request);
        if (request.getSalesmanId() != null && !Objects.equals(request.getSalesmanId(), contract.getSalesmanId())) {
            Owner owner = resolveOwner(request.getSalesmanId());
            contract.setSalesmanId(owner.userId());
            contract.setSalesmanName(owner.name());
            contract.setDeptId(owner.deptId());
        }
        validateContract(contract);
        resolveServicePerson(contract);
        assertNoOtherActiveContract(contract);
        updateContractWithActiveInvariant(contract);
        logContractChange(contract, "update", "更新合同与服务信息", before, contract);
        if (contract.getOrderId() != null) log(contract.getOrderId(), "contract_update", "修改代理记账合同 " + contract.getContractNo(), null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void terminateContract(Long id, String reason) {
        requireReviewer();
        if (!StringUtils.hasText(reason)) throw new BusinessException("请填写流失原因");
        FeigeAccountingContract contract = requireContract(id);
        FeigeAccountingContract before = snapshotContract(contract);
        contract.setContractStatus("terminated");
        contract.setLossFlag(1);
        contract.setLossReason(reason.trim());
        contract.setRenewalStatus("lossCustomer");
        contractMapper.updateById(contract);
        logContractChange(contract, "loss", "合同转为流失客户", before, contract);
        if (contract.getOrderId() != null) log(contract.getOrderId(), "contract_terminate", "终止代理记账合同 " + contract.getContractNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long renewContract(Long id, FeigeContractRenewalRequest request) {
        FeigeAccountingContract contract = requireContract(id);
        LocalDate start = request.getStartDate() != null ? request.getStartDate() : contract.getExpireDate();
        if (start != null && request.getExpireDate().isBefore(start)) {
            throw new BusinessException("续费截止日期不能早于续费开始日期");
        }
        FeigeAccountingContract before = snapshotContract(contract);
        FeigeContractRenewal renewal = new FeigeContractRenewal();
        renewal.setContractId(id);
        renewal.setRenewalDate(LocalDate.now());
        renewal.setStartDate(start);
        renewal.setExpireDate(request.getExpireDate());
        renewal.setAmount(money(request.getAmount()));
        renewal.setGiftMonth(request.getGiftMonth() == null ? 0 : Math.max(0, request.getGiftMonth()));
        renewal.setPayType(trimToNull(request.getPayType()));
        renewal.setOperatorId(SecurityUtils.getCurrentUserId());
        renewal.setOperatorName(resolveUserName(SecurityUtils.getCurrentUserId()));
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
        requireReviewer();
        FeigeAccountingContract contract = requireContract(id);
        if (!Integer.valueOf(1).equals(contract.getLossFlag())
                && !"terminated".equals(contract.getContractStatus())) {
            throw new BusinessException("当前合同不是流失状态");
        }
        FeigeAccountingContract before = snapshotContract(contract);
        contract.setContractStatus("executing");
        contract.setLossFlag(0);
        contract.setLossReason(null);
        contract.setRenewalStatus("normal");
        assertNoOtherActiveContract(contract);
        updateContractWithActiveInvariant(contract);
        logContractChange(contract, "restore", "恢复正常服务" + optionalSuffix(reason), before, contract);
    }

    public List<FeigeAccountingContract> previewHandover(FeigeContractHandoverRequest request) {
        requireReviewer();
        resolveVisibleStaff(request.getTargetStaffId());
        LambdaQueryWrapper<FeigeAccountingContract> query = handoverQuery(request);
        query.orderByAsc(FeigeAccountingContract::getExpireDate);
        return contractMapper.selectList(query);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long handover(FeigeContractHandoverRequest request) {
        requireReviewer();
        SysUser target = resolveVisibleStaff(request.getTargetStaffId());
        SysUser source = request.getSourceStaffId() == null ? null : resolveVisibleStaff(request.getSourceStaffId());
        List<FeigeAccountingContract> contracts = contractMapper.selectList(handoverQuery(request));
        if (contracts.isEmpty()) throw new BusinessException("没有可交接的合同");
        String ids = contracts.stream().map(item -> String.valueOf(item.getId())).collect(Collectors.joining(","));
        for (FeigeAccountingContract contract : contracts) {
            FeigeAccountingContract before = snapshotContract(contract);
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
        handover.setOperatorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        contractHandoverMapper.insert(handover);
        return handover.getId();
    }

    public List<FeigeContractHandover> listHandoverHistory() {
        requireReviewer();
        return contractHandoverMapper.selectList(new LambdaQueryWrapper<FeigeContractHandover>()
                .orderByDesc(FeigeContractHandover::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public void revokeHandover(Long id) {
        requireReviewer();
        FeigeContractHandover handover = contractHandoverMapper.selectOne(
                new LambdaQueryWrapper<FeigeContractHandover>().eq(FeigeContractHandover::getId, id).last("FOR UPDATE"));
        if (handover == null) throw new BusinessException("交接记录不存在");
        if (!"completed".equals(handover.getStatus())) throw new BusinessException("该交接已撤销");
        if (handover.getSourceStaffId() == null) throw new BusinessException("未指定原服务人员的交接不能自动撤销");
        SysUser source = resolveVisibleStaff(handover.getSourceStaffId());
        for (Long contractId : parseIds(handover.getAffectedContractIds())) {
            FeigeAccountingContract contract = requireContract(contractId);
            if (!roleStaffMatches(contract, handover.getServiceRole(), handover.getTargetStaffId())) continue;
            FeigeAccountingContract before = snapshotContract(contract);
            applyHandoverStaff(contract, handover.getServiceRole(), source);
            contractMapper.updateById(contract);
            logContractChange(contract, "handover_revoke", "撤销服务人员交接", before, contract);
        }
        handover.setStatus("revoked");
        handover.setRevokedTime(LocalDateTime.now());
        contractHandoverMapper.updateById(handover);
    }

    public List<Map<String, Object>> staffOptions() {
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        LambdaQueryWrapper<SysUser> query = new LambdaQueryWrapper<SysUser>()
                .select(SysUser::getId, SysUser::getNickname, SysUser::getUsername, SysUser::getDeptId)
                .eq(SysUser::getStatus, 0)
                .orderByAsc(SysUser::getDeptId)
                .orderByAsc(SysUser::getId);
        if (visibleIds != null) query.in(SysUser::getId, visibleIds);
        List<SysUser> users = userMapper.selectList(query);
        Map<Long, String> depts = resolveDeptNames(users.stream().map(SysUser::getDeptId).toList());
        List<Map<String, Object>> result = new ArrayList<>();
        for (SysUser user : users) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", user.getId());
            row.put("name", StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
            row.put("deptId", user.getDeptId());
            row.put("deptName", depts.get(user.getDeptId()));
            result.add(row);
        }
        return result;
    }

    private void applyOrderFilters(LambdaQueryWrapper<FeigeOrder> query, String keyword, String status,
                                   String businessType, String customerSource, Long salesmanId,
                                   LocalDate startDate, LocalDate endDate) {
        query.eq(StringUtils.hasText(status), FeigeOrder::getStatus, status)
                .eq(StringUtils.hasText(businessType), FeigeOrder::getBusinessType, businessType)
                .eq(StringUtils.hasText(customerSource), FeigeOrder::getCustomerSource, customerSource)
                .eq(salesmanId != null, FeigeOrder::getSalesmanId, salesmanId)
                .ge(startDate != null, FeigeOrder::getOrderDate, startDate)
                .le(endDate != null, FeigeOrder::getOrderDate, endDate);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getCompanyName, keyword)
                    .or().like(FeigeOrder::getOrderNo, keyword)
                    .or().like(FeigeOrder::getContacts, keyword)
                    .or().like(FeigeOrder::getContactPhone, keyword));
        }
    }

    private void applyOrderFields(FeigeOrder order, FeigeOrderRequest request, boolean includeReceived) {
        order.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());
        order.setCompanyName(request.getCompanyName().trim());
        order.setContacts(trimToNull(request.getContacts()));
        order.setContactPhone(trimToNull(request.getContactPhone()));
        order.setRegion(trimToNull(request.getRegion()));
        order.setAddress(trimToNull(request.getAddress()));
        order.setBusinessType(request.getBusinessType());
        order.setOpportunitySource(trimToNull(request.getOpportunitySource()));
        order.setDeliveryMethod(trimToNull(request.getDeliveryMethod()));
        order.setOrderAmount(money(request.getOrderAmount()));
        order.setContractAmount(money(request.getContractAmount()));
        order.setFinalPaymentAmount(money(request.getFinalPaymentAmount()));
        if (includeReceived) order.setReceivedAmount(money(request.getReceivedAmount()));
        order.setCollectionTime(request.getCollectionTime());
        order.setCollectionAccountNumber(trimToNull(request.getCollectionAccountNumber()));
        order.setRecurring(request.getRecurring() == null ? 0 : (request.getRecurring() == 1 ? 1 : 0));
        order.setVoucher(trimToNull(request.getVoucher()));
        order.setRemarks(trimToNull(request.getRemarks()));
        order.setTeamName(trimToNull(request.getTeamName()));
        order.setCompanyId(request.getCompanyId());
        order.setCustomerSource(trimToNull(defaultText(request.getCustomerSource(), request.getOpportunitySource())));
        order.setSourceDetail(trimToNull(request.getSourceDetail()));
        order.setRepurchaseCount(order.getRepurchaseCount() == null
                ? (Integer.valueOf(1).equals(request.getRecurring()) ? 1 : 0) : order.getRepurchaseCount());
        order.setCompanyNature(trimToNull(defaultText(request.getCompanyNature(), request.getEnterpriseNature())));
        order.setBusinessData(writeJson(request.getBusinessData()));
    }

    private void rejectSealOrderCreation(FeigeOrderRequest request) {
        if (request != null && isSealBusiness(request.getBusinessType())) {
            throw new BusinessException(409, "刻章业务请使用订单管理中的完整刻章提单");
        }
    }

    private boolean isSealBusiness(String businessType) {
        return BUSINESS_TYPE_SEAL.equalsIgnoreCase(businessType == null ? "" : businessType.trim());
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

    private void createContractFromOrder(FeigeOrder order, FeigeOrderRequest request) {
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

    private void assertNoOtherActiveContract(FeigeAccountingContract contract) {
        if (contract.getOrderId() == null || !isActiveContractStatus(contract.getContractStatus())) {
            return;
        }
        requireOrder(contract.getOrderId(), true);
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
            SysUser user = resolveVisibleStaff(contract.getServicePersonId());
            contract.setServicePersonName(displayName(user));
            contract.setAccountantId(contract.getServicePersonId());
            contract.setAccountantName(contract.getServicePersonName());
        }
        contract.setFinanceDirectorName(resolveOptionalStaffName(contract.getFinanceDirectorId()));
        contract.setFinanceAdvisorName(resolveOptionalStaffName(contract.getFinanceAdvisorId()));
    }

    private void createDefaultOrderSteps(FeigeOrder order) {
        String[] names = {"财务审核", "资料交接", "服务办理", "交付确认"};
        for (int i = 0; i < names.length; i++) {
            FeigeOrderStep step = new FeigeOrderStep();
            step.setOrderId(order.getId());
            step.setStepNo(i + 1);
            step.setStepName(names[i]);
            step.setStatus(i == 0 ? "processing" : "pending");
            step.setAssigneeId(i == 0 ? null : order.getSalesmanId());
            step.setAssigneeName(i == 0 ? "财务审核" : order.getSalesmanName());
            orderStepMapper.insert(step);
        }
    }

    private List<FeigeOrderStep> syntheticOrderSteps(FeigeOrder order) {
        String[] names = {"财务审核", "资料交接", "服务办理", "交付确认"};
        int completed = ORDER_COMPLETED.equals(order.getStatus()) ? 4
                : ORDER_IN_PROGRESS.equals(order.getStatus()) ? 1 : 0;
        List<FeigeOrderStep> result = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            FeigeOrderStep step = new FeigeOrderStep();
            step.setId(-(order.getId() * 10 + i + 1));
            step.setOrderId(order.getId());
            step.setStepNo(i + 1);
            step.setStepName(names[i]);
            step.setStatus(i < completed ? "completed" : i == completed ? "processing" : "pending");
            step.setAssigneeName(i == 0 ? "财务审核" : order.getSalesmanName());
            result.add(step);
        }
        return result;
    }

    private void updateStepAfterAudit(FeigeOrder order, boolean approved, String remark) {
        List<FeigeOrderStep> steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, order.getId()).orderByAsc(FeigeOrderStep::getStepNo));
        if (steps.isEmpty()) {
            createDefaultOrderSteps(order);
            steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                    .eq(FeigeOrderStep::getOrderId, order.getId()).orderByAsc(FeigeOrderStep::getStepNo));
        }
        for (FeigeOrderStep step : steps) {
            if (Integer.valueOf(1).equals(step.getStepNo())) {
                step.setStatus(approved ? "completed" : "rejected");
                step.setCompletedTime(LocalDateTime.now());
                step.setRemark(trimToNull(remark));
                step.setAssigneeId(SecurityUtils.getCurrentUserId());
                step.setAssigneeName(resolveUserName(SecurityUtils.getCurrentUserId()));
                orderStepMapper.updateById(step);
            } else if (Integer.valueOf(2).equals(step.getStepNo())) {
                step.setStatus(approved ? "processing" : "pending");
                orderStepMapper.updateById(step);
            }
        }
    }

    private void completeAllOrderSteps(FeigeOrder order) {
        List<FeigeOrderStep> steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, order.getId()));
        if (steps.isEmpty()) {
            createDefaultOrderSteps(order);
            steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                    .eq(FeigeOrderStep::getOrderId, order.getId()));
        }
        for (FeigeOrderStep step : steps) {
            step.setStatus("completed");
            if (step.getCompletedTime() == null) step.setCompletedTime(LocalDateTime.now());
            orderStepMapper.updateById(step);
        }
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

    private SysUser resolveVisibleStaff(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException("服务人员不存在或已停用");
        }
        if (!dataScopeHelper.canAccessOwner(user.getId())) {
            throw new AccessDeniedException("无权选择数据范围外的服务人员");
        }
        return user;
    }

    private String resolveOptionalStaffName(Long userId) {
        return userId == null ? null : displayName(resolveVisibleStaff(userId));
    }

    private String displayName(SysUser user) {
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private void logContractChange(FeigeAccountingContract contract, String type, String desc,
                                   FeigeAccountingContract before, FeigeAccountingContract after) {
        FeigeContractChangeLog row = new FeigeContractChangeLog();
        row.setContractId(contract.getId());
        row.setChangeType(type);
        row.setChangeDesc(desc);
        row.setOperatorId(SecurityUtils.getCurrentUserId());
        row.setOperatorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        row.setBeforeData(writeJson(before));
        row.setAfterData(writeJson(after));
        contractChangeLogMapper.insert(row);
    }

    private FeigeAccountingContract snapshotContract(FeigeAccountingContract source) {
        return objectMapper.convertValue(source, FeigeAccountingContract.class);
    }

    private String writeJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new BusinessException("业务扩展信息格式错误");
        }
    }

    private List<Long> parseIds(String value) {
        if (!StringUtils.hasText(value)) return List.of();
        try {
            return java.util.Arrays.stream(value.split(","))
                    .map(String::trim).filter(StringUtils::hasText).map(Long::valueOf).toList();
        } catch (NumberFormatException ex) {
            throw new BusinessException("交接记录中的合同清单无效");
        }
    }

    private int monthsBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) return 0;
        return Math.max(1, Math.toIntExact(ChronoUnit.MONTHS.between(start.withDayOfMonth(1),
                end.withDayOfMonth(1))) + 1);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String optionalSuffix(String value) {
        return StringUtils.hasText(value) ? "：" + value.trim() : "";
    }

    private void validateOrderAmounts(FeigeOrder order) {
        if (money(order.getReceivedAmount()).compareTo(money(order.getContractAmount())) > 0) {
            throw new BusinessException("已收金额不能超过合同金额");
        }
    }

    private void validateContract(FeigeAccountingContract contract) {
        if (contract.getSignDate() != null && contract.getExpireDate() != null
                && contract.getExpireDate().isBefore(contract.getSignDate())) {
            throw new BusinessException("合同截止日期不能早于签署日期");
        }
    }

    private FeigeOrder requireOrder(Long id, boolean forUpdate) {
        FeigeOrder order;
        if (forUpdate) {
            order = orderMapper.selectOne(new LambdaQueryWrapper<FeigeOrder>()
                    .eq(FeigeOrder::getId, id).last("FOR UPDATE"));
        } else {
            order = orderMapper.selectById(id);
        }
        if (order == null) throw new BusinessException("飞哥版订单不存在");
        if (!dataScopeHelper.canAccess(order.getSalesmanId(), order.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的飞哥版订单");
        }
        return order;
    }

    private FeigeOrderRefund requireRefund(Long id, boolean forUpdate) {
        FeigeOrderRefund refund = forUpdate
                ? refundMapper.selectOne(new LambdaQueryWrapper<FeigeOrderRefund>()
                    .eq(FeigeOrderRefund::getId, id).last("FOR UPDATE"))
                : refundMapper.selectById(id);
        if (refund == null) throw new BusinessException("退费申请不存在");
        if (!dataScopeHelper.canAccess(refund.getSalesmanId(), refund.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的退费申请");
        }
        return refund;
    }

    private FeigeAccountingContract requireContract(Long id) {
        FeigeAccountingContract contract = contractMapper.selectById(id);
        if (contract == null) throw new BusinessException("代理记账合同不存在");
        if (!dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的代理记账合同");
        }
        return contract;
    }

    private Owner resolveOwner(Long requestedUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long userId = requestedUserId == null ? currentUserId : requestedUserId;
        if (userId == null) throw new AccessDeniedException("当前登录身份无效");
        if (!Objects.equals(userId, currentUserId)) {
            if (!dataScopeHelper.isManagerOrAdmin() || !dataScopeHelper.canAccessOwner(userId)) {
                throw new AccessDeniedException("无权把订单分配给数据范围外人员");
            }
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException("负责人账号不存在或已停用");
        }
        String name = StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
        return new Owner(user.getId(), name, user.getDeptId());
    }

    private Owner ownerFromOrder(FeigeOrder order) {
        return new Owner(order.getSalesmanId(), order.getSalesmanName(), order.getDeptId());
    }

    private void requireReviewer() {
        if (!(dataScopeHelper.isManagerOrAdmin()
                || SecurityUtils.hasAnyRole("finance", "finance_hq", "boss"))) {
            throw new AccessDeniedException("仅主管、财务或老板可审核退费");
        }
    }

    private void requireFinanceReviewer() {
        if (!(SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("finance", "finance_hq", "boss"))) {
            throw new AccessDeniedException("仅财务、老板或超级管理员可执行财务审核");
        }
    }

    private void fillReview(FeigeOrderRefund refund, String status, String comment) {
        Long reviewerId = SecurityUtils.getCurrentUserId();
        refund.setStatus(status);
        refund.setReviewerId(reviewerId);
        refund.setReviewerName(resolveUserName(reviewerId));
        refund.setReviewTime(LocalDateTime.now());
        refund.setReviewComment(trimToNull(comment));
    }

    private void log(Long orderId, String type, String desc, String remarks) {
        FeigeOrderOperationLog row = new FeigeOrderOperationLog();
        row.setOrderId(orderId);
        row.setOperationType(type);
        row.setOperationDesc(desc);
        row.setOperatorId(SecurityUtils.getCurrentUserId());
        row.setOperatorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        row.setRemarks(trimToNull(remarks));
        operationLogMapper.insert(row);
    }

    private void enqueueTaskBridge(FeigeOrder order, String triggerEvent) {
        Long operatorId = SecurityUtils.getCurrentUserId();
        orderTaskBridgeService.enqueue(order, triggerEvent, operatorId, resolveUserName(operatorId));
    }

    private String resolveUserName(Long userId) {
        if (userId == null) return SecurityUtils.getCurrentUsername();
        String name = dataScopeHelper.resolveUserNames(List.of(userId)).get(userId);
        return StringUtils.hasText(name) ? name : SecurityUtils.getCurrentUsername();
    }

    private Map<Long, String> resolveDeptNames(Collection<Long> deptIds) {
        List<Long> ids = deptIds.stream().filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return deptMapper.selectList(new LambdaQueryWrapper<SysDept>()
                        .select(SysDept::getId, SysDept::getDeptName).in(SysDept::getId, ids))
                .stream().collect(Collectors.toMap(SysDept::getId, SysDept::getDeptName, (a, b) -> a));
    }

    private void fillOutstanding(FeigeOrder order) {
        order.setOutstandingAmount(nonNegative(money(order.getContractAmount()).subtract(money(order.getReceivedAmount()))));
    }

    private <T> Page<T> page(int pageNum, int pageSize) {
        int safePage = Math.max(1, pageNum);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        return new Page<>(safePage, safeSize);
    }

    private BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal nonNegative(BigDecimal value) {
        return value.compareTo(ZERO) < 0 ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String nextNo(String prefix) {
        return prefix + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"))
                + ThreadLocalRandom.current().nextInt(10, 100);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private record Owner(Long userId, String name, Long deptId) {
    }
}
