package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;
import com.zhehang.erp.modules.crm.service.ICrmPoolConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm/pool-config")
@RequiredArgsConstructor
public class CrmPoolConfigController {

    private final ICrmPoolConfigService poolConfigService;

    @GetMapping("/list")
    public R<List<CrmPoolConfig>> list() {
        return R.ok(poolConfigService.listPools());
    }

    @GetMapping("/{id}")
    public R<CrmPoolConfig> getInfo(@PathVariable Long id) {
        return R.ok(poolConfigService.getById(id));
    }

    @PostMapping
    @Log(module = "公海池配置", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmPoolConfig poolConfig) {
        poolConfigService.createPool(poolConfig);
        return R.ok();
    }

    @PutMapping
    @Log(module = "公海池配置", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmPoolConfig poolConfig) {
        poolConfigService.updatePool(poolConfig);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "公海池配置", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        poolConfigService.deletePool(id);
        return R.ok();
    }

    @GetMapping("/by-type/{type}")
    public R<CrmPoolConfig> getByType(@PathVariable String type) {
        return R.ok(poolConfigService.getPoolByType(type));
    }
}
