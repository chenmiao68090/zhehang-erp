package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseOrder;
import com.zhehang.erp.modules.supply.domain.entity.SupplyReturn;
import com.zhehang.erp.modules.supply.domain.entity.SupplyVendor;
import com.zhehang.erp.modules.supply.service.impl.SupplyPurchaseOrderServiceImpl;
import com.zhehang.erp.modules.supply.service.impl.SupplyReturnServiceImpl;
import com.zhehang.erp.modules.supply.service.impl.SupplyVendorServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/supply/reconciliation")
@RequiredArgsConstructor
public class SupplyReconciliationController {

    private final SupplyVendorServiceImpl vendorService;
    private final SupplyPurchaseOrderServiceImpl orderService;
    private final SupplyReturnServiceImpl returnService;

    @GetMapping("/summary")
    public R<List<Map<String, Object>>> summary() {
        List<SupplyVendor> vendors = vendorService.list();
        List<Map<String, Object>> result = new ArrayList<>();

        for (SupplyVendor vendor : vendors) {
            Map<String, Object> item = new HashMap<>();
            item.put("vendorId", vendor.getId());
            item.put("vendorName", vendor.getName());

            // 采购总额
            LambdaQueryWrapper<SupplyPurchaseOrder> orderWrapper = new LambdaQueryWrapper<>();
            orderWrapper.eq(SupplyPurchaseOrder::getVendorId, vendor.getId());
            List<SupplyPurchaseOrder> orders = orderService.list(orderWrapper);
            BigDecimal purchaseTotal = orders.stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            item.put("purchaseTotal", purchaseTotal);

            // 退货总额
            LambdaQueryWrapper<SupplyReturn> returnWrapper = new LambdaQueryWrapper<>();
            returnWrapper.eq(SupplyReturn::getVendorId, vendor.getId());
            List<SupplyReturn> returns = returnService.list(returnWrapper);
            BigDecimal returnTotal = returns.stream()
                    .map(r -> r.getAmount() != null ? r.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            item.put("returnTotal", returnTotal);

            // 应付余额
            item.put("payableBalance", purchaseTotal.subtract(returnTotal));

            result.add(item);
        }
        return R.ok(result);
    }
}
