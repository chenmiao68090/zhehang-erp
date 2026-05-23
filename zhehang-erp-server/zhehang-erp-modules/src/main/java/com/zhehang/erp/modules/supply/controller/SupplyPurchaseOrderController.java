package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseOrder;
import com.zhehang.erp.modules.supply.service.impl.SupplyPurchaseOrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supply/purchase-order")
@RequiredArgsConstructor
public class SupplyPurchaseOrderController {

    private final SupplyPurchaseOrderServiceImpl orderService;

    @GetMapping("/list")
    public R<IPage<SupplyPurchaseOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long vendorId) {
        return R.ok(orderService.selectPage(pageNum, pageSize, orderNo, status, vendorId));
    }

    @GetMapping("/{id}")
    public R<SupplyPurchaseOrder> getInfo(@PathVariable Long id) {
        return R.ok(orderService.getById(id));
    }

    @PostMapping
    @Log(module = "Purchase Order", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SupplyPurchaseOrder order) {
        orderService.createFromReq(order);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Purchase Order", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody SupplyPurchaseOrder order) {
        orderService.updateById(order);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Purchase Order", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        orderService.removeById(id);
        return R.ok();
    }

    @PutMapping("/confirm/{id}")
    @Log(module = "Purchase Order", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@PathVariable Long id) {
        orderService.confirm(id);
        return R.ok();
    }

    @PutMapping("/ship/{id}")
    @Log(module = "Purchase Order", type = Log.OperationType.UPDATE)
    public R<Void> markShipped(@PathVariable Long id) {
        orderService.markShipped(id);
        return R.ok();
    }

    @PutMapping("/arrive/{id}")
    @Log(module = "Purchase Order", type = Log.OperationType.UPDATE)
    public R<Void> markArrived(@PathVariable Long id) {
        orderService.markArrived(id);
        return R.ok();
    }
}
