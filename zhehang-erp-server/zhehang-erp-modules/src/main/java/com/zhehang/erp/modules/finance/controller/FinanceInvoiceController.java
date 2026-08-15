package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceInvoice;
import com.zhehang.erp.modules.finance.service.impl.FinanceInvoiceServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/finance/invoice")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceInvoiceController {

    private final FinanceInvoiceServiceImpl invoiceService;

    @GetMapping("/list")
    public R<IPage<FinanceInvoice>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String invoiceNo,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String invoiceType,
            @RequestParam(required = false) String direction) {
        return R.ok(invoiceService.selectPage(pageNum, pageSize, invoiceNo, customerId, invoiceType, direction));
    }

    @PostMapping
    @Log(module = "Finance Invoice", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody FinanceInvoice invoice) {
        invoice.setStatus(1);
        return invoiceService.save(invoice)
                ? R.ok()
                : R.fail(500, "发票新增失败");
    }

    @PutMapping
    @Log(module = "Finance Invoice", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody FinanceInvoice invoice) {
        return invoiceService.updateById(invoice)
                ? R.ok()
                : R.fail(404, "发票不存在或已删除");
    }

    @DeleteMapping("/{id}")
    @Log(module = "Finance Invoice", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        return invoiceService.removeById(id)
                ? R.ok()
                : R.fail(404, "发票不存在或已删除");
    }

    @GetMapping("/stats")
    public R<Map<String, BigDecimal>> stats() {
        return R.ok(invoiceService.getStats());
    }
}
