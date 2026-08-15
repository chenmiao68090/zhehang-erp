package com.zhehang.erp.modules.sales.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.sales.domain.entity.SalesReceipt;
import com.zhehang.erp.modules.sales.service.ISalesReceiptService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sales/receipt")
@RequiredArgsConstructor
public class SalesReceiptController {

    private final ISalesReceiptService receiptService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<SalesReceipt>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return R.ok(receiptService.selectPage(pageNum, pageSize, customerId, status, startDate, endDate));
    }

    @GetMapping("/{id}")
    public R<SalesReceipt> getInfo(@PathVariable Long id) {
        SalesReceipt receipt = receiptService.getById(id);
        if (receipt != null && !dataScopeHelper.canAccess(receipt.getCreateBy(), null)) {
            return R.fail("无权操作他人记录");
        }
        return R.ok(receipt);
    }

    @PostMapping
    @Log(module = "回款管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SalesReceipt receipt) {
        receiptService.save(receipt);
        return R.ok();
    }

    @PutMapping
    @Log(module = "回款管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SalesReceipt receipt) {
        SalesReceipt existing = receiptService.getById(receipt.getId());
        if (existing == null || !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权操作他人记录");
        }
        receiptService.updateById(receipt);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "回款管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        SalesReceipt existing = receiptService.getById(id);
        if (existing == null || !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权操作他人记录");
        }
        receiptService.removeById(id);
        return R.ok();
    }

    @GetMapping("/overdue")
    public R<List<SalesReceipt>> overdueList() {
        return R.ok(receiptService.overdueList());
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> monthlyStats() {
        return R.ok(receiptService.monthlyStats());
    }
}
