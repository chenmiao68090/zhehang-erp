package com.zhehang.erp.modules.receipt.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.receipt.domain.BizInvoice;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.domain.BizReceiptPlan;
import com.zhehang.erp.modules.receipt.service.IBizReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/receipt")
@RequiredArgsConstructor
public class BizReceiptController {

    private final IBizReceiptService receiptService;

    @GetMapping("/list")
    public R<IPage<BizReceipt>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Integer status) {
        return R.ok(receiptService.selectPage(pageNum, pageSize, customerId, orderId, status));
    }

    @GetMapping("/{id}")
    public R<BizReceipt> detail(@PathVariable Long id) {
        return R.ok(receiptService.getById(id));
    }

    @PostMapping("/confirm")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@RequestBody BizReceipt receipt, @RequestParam(required = false) Long operatorId) {
        receiptService.confirm(receipt, operatorId);
        return R.ok();
    }

    @GetMapping("/plans/{orderId}")
    public R<List<BizReceiptPlan>> plans(@PathVariable Long orderId) {
        return R.ok(receiptService.getPlans(orderId));
    }

    @PostMapping("/plan/pay")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> payPlan(@RequestBody Map<String, Object> body) {
        Long planId = Long.valueOf(body.get("planId").toString());
        BigDecimal amount = body.get("amount") != null
                ? new BigDecimal(body.get("amount").toString()) : BigDecimal.ZERO;
        receiptService.payPlan(planId, amount);
        return R.ok();
    }

    @GetMapping("/overdue")
    public R<List<BizReceiptPlan>> overdue() {
        return R.ok(receiptService.getOverdue());
    }

    @PostMapping("/refund")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> refund(@RequestBody Map<String, Object> body) {
        Long receiptId = Long.valueOf(body.get("receiptId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        Long operatorId = body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        receiptService.refund(receiptId, amount, reason, operatorId);
        return R.ok();
    }

    @GetMapping("/invoices")
    public R<IPage<BizInvoice>> invoices(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return R.ok(receiptService.getInvoices(pageNum, pageSize, customerId, status));
    }

    @PostMapping("/invoice")
    @Log(module = "发票管理", type = Log.OperationType.INSERT)
    public R<Long> createInvoice(@RequestBody BizInvoice invoice) {
        return R.ok(receiptService.createInvoice(invoice));
    }

    @PutMapping("/invoice/{id}")
    @Log(module = "发票管理", type = Log.OperationType.UPDATE)
    public R<Void> updateInvoice(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer status = body.get("status") != null
                ? Integer.valueOf(body.get("status").toString()) : null;
        String trackingNo = body.get("trackingNo") != null ? body.get("trackingNo").toString() : null;
        receiptService.updateInvoiceStatus(id, status, trackingNo);
        return R.ok();
    }

    @GetMapping("/summary")
    public R<Map<String, Object>> summary(@RequestParam(required = false) String month) {
        return R.ok(receiptService.monthlySummary(month));
    }
}
