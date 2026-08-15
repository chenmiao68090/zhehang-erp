package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyVendor;
import com.zhehang.erp.modules.supply.service.impl.SupplyVendorServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/supply/vendor")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "供应商档案包含银行账号")
public class SupplyVendorController {

    private final SupplyVendorServiceImpl vendorService;

    @GetMapping("/list")
    public R<IPage<SupplyVendor>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Integer status) {
        return R.ok(vendorService.selectPage(pageNum, pageSize, name, rating, status));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> getDetail(@PathVariable Long id) {
        return R.ok(vendorService.getDetail(id));
    }

    @PostMapping
    @Log(module = "Supply Vendor", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SupplyVendor vendor) {
        vendorService.save(vendor);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Supply Vendor", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody SupplyVendor vendor) {
        vendorService.updateById(vendor);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Supply Vendor", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        vendorService.removeById(id);
        return R.ok();
    }

    @PutMapping("/rating")
    @Log(module = "Supply Vendor", type = Log.OperationType.UPDATE)
    public R<Void> updateRating(@RequestParam Long id, @RequestParam Integer rating) {
        vendorService.updateRating(id, rating);
        return R.ok();
    }

    @GetMapping("/all")
    public R<?> allVendors() {
        return R.ok(vendorService.list());
    }
}
