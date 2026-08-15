package com.zhehang.erp.modules.feigeorder.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractHandoverRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeContractRenewalRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderAuditRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigePaymentRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeRefundRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeRefundReviewRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractHandover;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractRenewal;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderPayment;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderRefund;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderStep;
import com.zhehang.erp.modules.feigeorder.service.FeigeOrderContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/feige-order-contract")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin', 'finance', 'finance_hq')")
public class FeigeOrderContractController {

    private final FeigeOrderContractService service;

    @GetMapping("/dashboard")
    public R<Map<String, Object>> dashboard() {
        return R.ok(service.dashboard());
    }

    @GetMapping("/staff-options")
    public R<List<Map<String, Object>>> staffOptions() {
        return R.ok(service.staffOptions());
    }

    @GetMapping("/orders")
    public R<IPage<FeigeOrder>> orders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String customerSource,
            @RequestParam(required = false) Long salesmanId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return R.ok(service.listOrders(pageNum, pageSize, keyword, status, businessType, customerSource,
                salesmanId, startDate, endDate));
    }

    @GetMapping("/orders/{id}")
    public R<FeigeOrder> order(@PathVariable Long id) {
        return R.ok(service.getOrder(id));
    }

    @PostMapping("/orders")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.INSERT)
    public R<Long> createOrder(@Valid @RequestBody FeigeOrderRequest request) {
        return R.ok(service.createOrder(request));
    }

    @PutMapping("/orders/{id}")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> updateOrder(@PathVariable Long id, @Valid @RequestBody FeigeOrderRequest request) {
        service.updateOrder(id, request);
        return R.ok();
    }

    @GetMapping("/audit-orders")
    public R<IPage<FeigeOrder>> auditOrders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long salesmanId,
            @RequestParam(required = false) String auditStatus) {
        return R.ok(service.listAuditOrders(pageNum, pageSize, keyword, salesmanId, auditStatus));
    }

    @PostMapping("/orders/{id}/audit")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> auditOrder(@PathVariable Long id, @Valid @RequestBody FeigeOrderAuditRequest request) {
        service.auditOrder(id, request);
        return R.ok();
    }

    @PostMapping("/orders/{id}/reject")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        service.rejectOrder(id, body == null ? null : body.get("reason"));
        return R.ok();
    }

    @PostMapping("/orders/{id}/confirm")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> confirmOrder(@PathVariable Long id) {
        service.confirmOrder(id);
        return R.ok();
    }

    @GetMapping("/orders/{id}/steps")
    public R<List<FeigeOrderStep>> orderSteps(@PathVariable Long id) {
        return R.ok(service.listOrderSteps(id));
    }

    @PostMapping("/orders/{id}/complete")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> completeOrder(@PathVariable Long id) {
        service.completeOrder(id);
        return R.ok();
    }

    @GetMapping("/orders/{id}/payments")
    public R<List<FeigeOrderPayment>> payments(@PathVariable Long id) {
        return R.ok(service.listPayments(id));
    }

    @PostMapping("/orders/{id}/payments")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.INSERT)
    public R<Long> addPayment(@PathVariable Long id, @Valid @RequestBody FeigePaymentRequest request) {
        return R.ok(service.addPayment(id, request));
    }

    @GetMapping("/orders/{id}/logs")
    public R<List<FeigeOrderOperationLog>> logs(@PathVariable Long id) {
        return R.ok(service.listLogs(id));
    }

    @GetMapping("/unreceived")
    public R<IPage<FeigeOrder>> unreceived(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long salesmanId) {
        return R.ok(service.listUnreceived(pageNum, pageSize, keyword, salesmanId));
    }

    @GetMapping("/refunds")
    public R<IPage<FeigeOrderRefund>> refunds(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return R.ok(service.listRefunds(pageNum, pageSize, keyword, status, startDate, endDate));
    }

    @PostMapping("/orders/{id}/refunds")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.INSERT)
    public R<Long> applyRefund(@PathVariable Long id, @Valid @RequestBody FeigeRefundRequest request) {
        return R.ok(service.applyRefund(id, request));
    }

    @PostMapping("/refunds/{id}/approve")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> approveRefund(@PathVariable Long id,
                                 @Valid @RequestBody(required = false) FeigeRefundReviewRequest request) {
        service.approveRefund(id, request == null ? null : request.getComment());
        return R.ok();
    }

    @PostMapping("/refunds/{id}/reject")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> rejectRefund(@PathVariable Long id,
                                @Valid @RequestBody(required = false) FeigeRefundReviewRequest request) {
        service.rejectRefund(id, request == null ? null : request.getComment());
        return R.ok();
    }

    @PostMapping("/refunds/{id}/complete")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> completeRefund(@PathVariable Long id,
                                  @Valid @RequestBody(required = false) FeigeRefundReviewRequest request) {
        service.completeRefund(id, request == null ? null : request.getComment());
        return R.ok();
    }

    @GetMapping("/contracts")
    public R<IPage<FeigeAccountingContract>> contracts(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String view,
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return R.ok(service.listContracts(pageNum, pageSize, keyword, status, view, staffId, startDate, endDate));
    }

    @GetMapping("/contracts/{id}")
    public R<FeigeAccountingContract> contract(@PathVariable Long id) {
        return R.ok(service.getContract(id));
    }

    @GetMapping("/contracts/{id}/renewals")
    public R<List<FeigeContractRenewal>> contractRenewals(@PathVariable Long id) {
        return R.ok(service.listContractRenewals(id));
    }

    @GetMapping("/contracts/{id}/changes")
    public R<List<FeigeContractChangeLog>> contractChanges(@PathVariable Long id) {
        return R.ok(service.listContractChanges(id));
    }

    @PostMapping("/contracts")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.INSERT)
    public R<Long> createContract(@Valid @RequestBody FeigeContractRequest request) {
        return R.ok(service.createContract(request));
    }

    @PutMapping("/contracts/{id}")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> updateContract(@PathVariable Long id, @Valid @RequestBody FeigeContractRequest request) {
        service.updateContract(id, request);
        return R.ok();
    }

    @PostMapping("/contracts/{id}/terminate")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> terminateContract(@PathVariable Long id,
                                     @RequestBody(required = false) Map<String, String> body) {
        service.terminateContract(id, body == null ? null : body.get("reason"));
        return R.ok();
    }

    @PostMapping("/contracts/{id}/renewals")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.INSERT)
    public R<Long> renewContract(@PathVariable Long id,
                                 @Valid @RequestBody FeigeContractRenewalRequest request) {
        return R.ok(service.renewContract(id, request));
    }

    @PostMapping("/contracts/{id}/restore")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> restoreContract(@PathVariable Long id,
                                   @RequestBody(required = false) Map<String, String> body) {
        service.restoreContract(id, body == null ? null : body.get("reason"));
        return R.ok();
    }

    @PostMapping("/contracts/handover/preview")
    public R<List<FeigeAccountingContract>> handoverPreview(
            @Valid @RequestBody FeigeContractHandoverRequest request) {
        return R.ok(service.previewHandover(request));
    }

    @PostMapping("/contracts/handover")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Long> handover(@Valid @RequestBody FeigeContractHandoverRequest request) {
        return R.ok(service.handover(request));
    }

    @GetMapping("/contracts/handover/history")
    public R<List<FeigeContractHandover>> handoverHistory() {
        return R.ok(service.listHandoverHistory());
    }

    @PostMapping("/contracts/handover/{id}/revoke")
    @Log(module = "订单与合同-飞哥版", type = Log.OperationType.UPDATE)
    public R<Void> revokeHandover(@PathVariable Long id) {
        service.revokeHandover(id);
        return R.ok();
    }
}
