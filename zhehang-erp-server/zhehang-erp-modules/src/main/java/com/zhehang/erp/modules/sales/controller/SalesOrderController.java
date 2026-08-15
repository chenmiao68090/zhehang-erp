package com.zhehang.erp.modules.sales.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.sales.domain.entity.SalesOrder;
import com.zhehang.erp.modules.sales.service.ISalesOrderService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/sales/order")
@RequiredArgsConstructor
public class SalesOrderController {

    private final ISalesOrderService orderService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<SalesOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String deliveryDate) {
        return R.ok(orderService.selectPage(pageNum, pageSize, orderNo, customerId, status, deliveryDate));
    }

    @GetMapping("/{id}")
    public R<SalesOrder> getInfo(@PathVariable Long id) {
        SalesOrder order = orderService.getById(id);
        if (order != null && !dataScopeHelper.canAccess(order.getCreateBy(), null)) {
            return R.fail("无权查看他人记录");
        }
        return R.ok(order);
    }

    @PostMapping
    @Log(module = "销售订单", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SalesOrder order) {
        orderService.save(order);
        return R.ok();
    }

    @PutMapping
    @Log(module = "销售订单", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SalesOrder order) {
        SalesOrder existing = orderService.getById(order.getId());
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权修改他人记录");
        }
        orderService.updateById(order);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "销售订单", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        SalesOrder order = orderService.getById(id);
        if (order != null && !dataScopeHelper.canAccess(order.getCreateBy(), null)) {
            return R.fail("无权删除他人记录");
        }
        orderService.removeById(id);
        return R.ok();
    }

    @PostMapping("/approve/{id}")
    @Log(module = "销售订单", type = Log.OperationType.UPDATE)
    public R<Void> approve(@PathVariable Long id) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        orderService.approve(id);
        return R.ok();
    }

    @PostMapping("/changeStatus")
    @Log(module = "销售订单", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestBody Map<String, Object> params) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        Object idObj = params.get("id");
        Object statusObj = params.get("status");
        if (idObj == null || statusObj == null) {
            return R.fail("缺少必要参数: id 或 status");
        }
        Long id = Long.parseLong(idObj.toString());
        Integer status = Integer.parseInt(statusObj.toString());
        orderService.changeStatus(id, status);
        return R.ok();
    }

    @PostMapping("/fromQuotation/{quotationId}")
    @Log(module = "销售订单", type = Log.OperationType.INSERT)
    public R<SalesOrder> fromQuotation(@PathVariable Long quotationId) {
        return R.ok(orderService.createFromQuotation(quotationId));
    }
}
