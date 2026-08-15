package com.zhehang.erp.modules.receipt.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.receipt.domain.BizFinanceTimeline;
import com.zhehang.erp.modules.receipt.domain.BizInvoice;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.domain.BizReceiptPlan;
import com.zhehang.erp.modules.receipt.mapper.BizFinanceTimelineMapper;
import com.zhehang.erp.modules.receipt.service.IBizReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/receipt")
@RequiredArgsConstructor
public class BizReceiptController {

    private final IBizReceiptService receiptService;
    private final BizFinanceTimelineMapper timelineMapper;
    private final DataScopeHelper dataScopeHelper;

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
        BizReceipt rec = receiptService.getById(id);
        if (rec != null && !dataScopeHelper.canAccess(rec.getCreateBy(), null)) {
            return R.fail("无权查看他人记录");
        }
        return R.ok(rec);
    }

    @PostMapping("/confirm")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@RequestBody BizReceipt receipt) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        receiptService.confirm(receipt, SecurityUtils.getCurrentUserId());
        return R.ok();
    }

    @GetMapping("/plans/{orderId}")
    public R<List<BizReceiptPlan>> plans(@PathVariable Long orderId) {
        return R.ok(receiptService.getPlans(orderId));
    }

    @PostMapping("/plan/pay")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> payPlan(@RequestBody Map<String, Object> body) {
        Object planIdValue = body.get("planId");
        if (planIdValue == null) {
            throw new BusinessException("收款计划ID不能为空");
        }
        Long planId = Long.valueOf(planIdValue.toString());
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
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        Long receiptId = Long.valueOf(body.get("receiptId").toString());
        Object amountValue = body.get("amount");
        if (amountValue == null) {
            throw new BusinessException("退款金额不能为空");
        }
        BigDecimal amount = new BigDecimal(amountValue.toString());
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        receiptService.refund(receiptId, amount, reason, SecurityUtils.getCurrentUserId());
        return R.ok();
    }

    @PostMapping("/reject")
    @Log(module = "收款核对", type = Log.OperationType.UPDATE)
    public R<Void> reject(@RequestBody Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        Long receiptId = Long.valueOf(body.get("receiptId").toString());
        String reason = body.get("reason") != null ? body.get("reason").toString() : null;
        receiptService.reject(receiptId, reason, SecurityUtils.getCurrentUserId());
        return R.ok();
    }

    @PostMapping("/posting")
    @Log(module = "入账管理", type = Log.OperationType.UPDATE)
    public R<BizReceipt> posting(@RequestBody Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        Object receiptIdValue = body.get("receiptId");
        if (receiptIdValue == null) {
            throw new BusinessException("缺少收款记录ID");
        }
        Long receiptId = Long.valueOf(receiptIdValue.toString());
        String postingAccount = body.get("postingAccount") != null ? body.get("postingAccount").toString() : null;
        BizReceipt receipt = receiptService.postReceipt(receiptId, postingAccount, SecurityUtils.getCurrentUserId());

        BizFinanceTimeline t = new BizFinanceTimeline();
        t.setReceiptId(receipt.getId());
        t.setOrderId(receipt.getOrderId());
        t.setType("receipt_posted");
        t.setTitle("收款入账 · " + receipt.getReceiptNo());
        t.setDetail("入账科目: " + receipt.getPostingAccount());
        String username = SecurityUtils.getCurrentUsername();
        t.setOperator(username != null ? username : "财务");
        t.setEventTime(LocalDateTime.now());
        timelineMapper.insert(t);
        return R.ok(receipt);
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

    /** 财务联动时间线:追加一条事件(原前端内存,现落库) */
    @PostMapping("/timeline")
    public R<Void> addTimeline(@RequestBody Map<String, Object> body) {
        BizFinanceTimeline t = new BizFinanceTimeline();
        t.setReceiptId(body.get("receiptId") != null ? Long.valueOf(body.get("receiptId").toString()) : null);
        t.setOrderId(body.get("orderId") != null ? Long.valueOf(body.get("orderId").toString()) : null);
        t.setType(body.get("type") != null ? body.get("type").toString() : null);
        t.setTitle(body.get("title") != null ? body.get("title").toString() : null);
        t.setDetail(body.get("detail") != null ? body.get("detail").toString() : null);
        t.setOperator(body.get("operator") != null ? body.get("operator").toString() : null);
        t.setEventTime(LocalDateTime.now());
        timelineMapper.insert(t);
        return R.ok();
    }

    /** 财务联动时间线:按收款/订单查询(倒序,默认50条,上限200) */
    @GetMapping("/timeline")
    public R<List<BizFinanceTimeline>> timeline(
            @RequestParam(required = false) Long receiptId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "50") Integer limit) {
        LambdaQueryWrapper<BizFinanceTimeline> w = new LambdaQueryWrapper<>();
        if (receiptId != null) {
            w.eq(BizFinanceTimeline::getReceiptId, receiptId);
        }
        if (orderId != null) {
            w.eq(BizFinanceTimeline::getOrderId, orderId);
        }
        w.orderByDesc(BizFinanceTimeline::getEventTime)
                .last("LIMIT " + Math.min(limit == null ? 50 : limit, 200));
        return R.ok(timelineMapper.selectList(w));
    }
}
