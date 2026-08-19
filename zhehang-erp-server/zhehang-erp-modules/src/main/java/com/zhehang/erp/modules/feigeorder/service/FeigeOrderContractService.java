package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractHandoverRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRenewalRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 飞哥版“订单与合同”对外门面，保持 FeigeOrderContractController 的调用面不变。
 *
 * <p>原本 1282 行的巨型 Service 已按业务职责拆分为四个领域 Service：
 * {@link FeigeOrderService}（订单核心）、{@link FeigeOrderAuditService}（财务审核）、
 * {@link FeigeContractService}（代理记账合同）、{@link FeigeRefundService}（退费），
 * 共享能力集中在 {@link FeigeOrderSupport} 与 {@link FeigeOrderConstants}。</p>
 *
 * <p>本类只做委派，不承载任何业务判断；事务注解与拆分前保持一致，跨域调用（如新单同时建合同）
 * 由领域 Service 在同一事务内完成。新增能力请直接写进对应领域 Service，不要在此处堆逻辑。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeOrderContractService {

    public static final String ORDER_PENDING = FeigeOrderConstants.ORDER_PENDING;
    public static final String ORDER_IN_PROGRESS = FeigeOrderConstants.ORDER_IN_PROGRESS;
    public static final String ORDER_COMPLETED = FeigeOrderConstants.ORDER_COMPLETED;
    public static final String ORDER_REFUND_PENDING = FeigeOrderConstants.ORDER_REFUND_PENDING;
    public static final String ORDER_REFUNDED = FeigeOrderConstants.ORDER_REFUNDED;
    public static final String ORDER_CANCELLED = FeigeOrderConstants.ORDER_CANCELLED;
    public static final String ORDER_REJECTED = FeigeOrderConstants.ORDER_REJECTED;

    private final FeigeOrderService orderService;
    private final FeigeOrderAuditService auditService;
    private final FeigeContractService contractService;
    private final FeigeRefundService refundService;
    private final FeigeOrderSupport support;

    // ---------- 订单核心 ----------

    public Map<String, Object> dashboard() {
        return orderService.dashboard();
    }

    public IPage<FeigeOrder> listOrders(int pageNum, int pageSize, String keyword, String status,
                                         String businessType, String customerSource, Long salesmanId,
                                         LocalDate startDate, LocalDate endDate) {
        return orderService.listOrders(pageNum, pageSize, keyword, status, businessType, customerSource,
                salesmanId, startDate, endDate);
    }

    public IPage<FeigeOrder> listUnreceived(int pageNum, int pageSize, String keyword, Long salesmanId) {
        return orderService.listUnreceived(pageNum, pageSize, keyword, salesmanId);
    }

    public FeigeOrder getOrder(Long id) {
        return orderService.getOrder(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(FeigeOrderRequest request) {
        return orderService.createOrder(request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(Long id, FeigeOrderRequest request) {
        orderService.updateOrder(id, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(Long id) {
        orderService.completeOrder(id);
    }

    public List<FeigeOrderStep> listOrderSteps(Long orderId) {
        return orderService.listOrderSteps(orderId);
    }

    public List<FeigeOrderPayment> listPayments(Long orderId) {
        return orderService.listPayments(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long addPayment(Long orderId, FeigePaymentRequest request) {
        return orderService.addPayment(orderId, request);
    }

    public List<FeigeOrderOperationLog> listLogs(Long orderId) {
        return orderService.listLogs(orderId);
    }

    // ---------- 审核流程 ----------

    public IPage<FeigeOrder> listAuditOrders(int pageNum, int pageSize, String keyword,
                                              Long salesmanId, String auditStatus) {
        return auditService.listAuditOrders(pageNum, pageSize, keyword, salesmanId, auditStatus);
    }

    @Transactional(rollbackFor = Exception.class)
    public void auditOrder(Long id, FeigeOrderAuditRequest request) {
        auditService.auditOrder(id, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectOrder(Long id, String reason) {
        auditService.rejectOrder(id, reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmOrder(Long id) {
        auditService.confirmOrder(id);
    }

    // ---------- 退费管理 ----------

    public IPage<FeigeOrderRefund> listRefunds(int pageNum, int pageSize, String keyword, String status,
                                                LocalDate startDate, LocalDate endDate) {
        return refundService.listRefunds(pageNum, pageSize, keyword, status, startDate, endDate);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long applyRefund(Long orderId, FeigeRefundRequest request) {
        return refundService.applyRefund(orderId, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveRefund(Long refundId, String comment) {
        refundService.approveRefund(refundId, comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectRefund(Long refundId, String comment) {
        refundService.rejectRefund(refundId, comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeRefund(Long refundId, String comment) {
        refundService.completeRefund(refundId, comment);
    }

    // ---------- 代理记账合同 ----------

    public IPage<FeigeAccountingContract> listContracts(int pageNum, int pageSize, String keyword,
                                                          String status, String view, Long staffId,
                                                          LocalDate startDate, LocalDate endDate) {
        return contractService.listContracts(pageNum, pageSize, keyword, status, view, staffId, startDate, endDate);
    }

    public FeigeAccountingContract getContract(Long id) {
        return contractService.getContract(id);
    }

    public List<FeigeContractRenewal> listContractRenewals(Long contractId) {
        return contractService.listContractRenewals(contractId);
    }

    public List<FeigeContractChangeLog> listContractChanges(Long contractId) {
        return contractService.listContractChanges(contractId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createContract(FeigeContractRequest request) {
        return contractService.createContract(request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateContract(Long id, FeigeContractRequest request) {
        contractService.updateContract(id, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void terminateContract(Long id, String reason) {
        contractService.terminateContract(id, reason);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long renewContract(Long id, FeigeContractRenewalRequest request) {
        return contractService.renewContract(id, request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void restoreContract(Long id, String reason) {
        contractService.restoreContract(id, reason);
    }

    public List<FeigeAccountingContract> previewHandover(FeigeContractHandoverRequest request) {
        return contractService.previewHandover(request);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long handover(FeigeContractHandoverRequest request) {
        return contractService.handover(request);
    }

    public List<FeigeContractHandover> listHandoverHistory() {
        return contractService.listHandoverHistory();
    }

    @Transactional(rollbackFor = Exception.class)
    public void revokeHandover(Long id) {
        contractService.revokeHandover(id);
    }

    // ---------- 共享下拉 ----------

    public List<Map<String, Object>> staffOptions() {
        return support.staffOptions();
    }
}
