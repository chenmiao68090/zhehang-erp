package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizSupplier;
import com.zhehang.erp.modules.channel.mapper.BizSupplierMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supplier")
@RequiredArgsConstructor
public class BizSupplierController {

    private final IBizChannelService channelService;
    private final BizSupplierMapper supplierMapper;

    @GetMapping("/list")
    public R<IPage<BizSupplier>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status) {
        return R.ok(channelService.supplierList(pageNum, pageSize, name, status));
    }

    @GetMapping("/{id}")
    public R<BizSupplier> detail(@PathVariable Long id) {
        return R.ok(supplierMapper.selectById(id));
    }

    @PostMapping
    @Log(module = "供应商管理", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizSupplier supplier) {
        supplier.setId(null);
        return R.ok(channelService.saveSupplier(supplier));
    }

    @PutMapping
    @Log(module = "供应商管理", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody BizSupplier supplier) {
        return R.ok(channelService.saveSupplier(supplier));
    }

    @DeleteMapping("/{id}")
    @Log(module = "供应商管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        channelService.removeSupplier(id);
        return R.ok();
    }
}
