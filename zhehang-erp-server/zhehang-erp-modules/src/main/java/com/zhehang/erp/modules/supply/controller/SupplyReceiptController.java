package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyReceipt;
import com.zhehang.erp.modules.supply.service.impl.SupplyReceiptServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supply/receipt")
@RequiredArgsConstructor
public class SupplyReceiptController {

    private final SupplyReceiptServiceImpl receiptService;

    @GetMapping("/list")
    public R<IPage<SupplyReceipt>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String receiptNo,
            @RequestParam(required = false) Integer status) {
        return R.ok(receiptService.selectPage(pageNum, pageSize, receiptNo, status));
    }

    @GetMapping("/{id}")
    public R<SupplyReceipt> getInfo(@PathVariable Long id) {
        return R.ok(receiptService.getById(id));
    }

    @PostMapping
    @Log(module = "Supply Receipt", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SupplyReceipt receipt) {
        receipt.setReceiptNo(receiptService.generateReceiptNo());
        if (receipt.getStatus() == null) receipt.setStatus(0);
        receiptService.save(receipt);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Supply Receipt", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody SupplyReceipt receipt) {
        receiptService.updateById(receipt);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Supply Receipt", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        receiptService.removeById(id);
        return R.ok();
    }

    @PutMapping("/inspect/{id}")
    @Log(module = "Supply Receipt", type = Log.OperationType.UPDATE)
    public R<Void> inspect(@PathVariable Long id, @RequestParam Integer result) {
        receiptService.inspect(id, result);
        return R.ok();
    }
}
