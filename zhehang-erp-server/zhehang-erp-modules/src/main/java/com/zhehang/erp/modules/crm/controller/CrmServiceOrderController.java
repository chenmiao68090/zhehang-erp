package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmServiceOrder;
import com.zhehang.erp.modules.crm.service.ICrmServiceOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm/service-order")
@RequiredArgsConstructor
public class CrmServiceOrderController {

    private final ICrmServiceOrderService serviceOrderService;

    @GetMapping("/list")
    public R<IPage<CrmServiceOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) Integer status) {
        return R.ok(serviceOrderService.selectPage(pageNum, pageSize, customerId, serviceType, status));
    }

    @PostMapping
    @Log(module = "服务订单", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmServiceOrder order) {
        serviceOrderService.save(order);
        return R.ok();
    }

    @PutMapping
    @Log(module = "服务订单", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmServiceOrder order) {
        serviceOrderService.updateById(order);
        return R.ok();
    }

    @GetMapping("/expiring")
    public R<List<CrmServiceOrder>> expiring(@RequestParam(defaultValue = "30") int days) {
        return R.ok(serviceOrderService.getExpiringOrders(days));
    }

    @PostMapping("/remind")
    @Log(module = "服务订单", type = Log.OperationType.UPDATE)
    public R<Integer> remind() {
        return R.ok(serviceOrderService.triggerRenewalReminder());
    }
}
