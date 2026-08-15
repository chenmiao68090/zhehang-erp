package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.service.ICrmPoolConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm/pool-config")
@RequiredArgsConstructor
public class CrmPoolConfigController {

    private final ICrmPoolConfigService poolConfigService;
    private final com.zhehang.erp.modules.crm.support.DataScopeHelper dataScopeHelper;

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
    public R<Boolean> add(@RequestBody CrmPoolConfig poolConfig) {
        requireManager();
        if (!poolConfigService.createPool(poolConfig)) {
            throw new BusinessException("公海池创建失败，未写入任何记录");
        }
        return R.ok(true);
    }

    @PutMapping
    @Log(module = "公海池配置", type = Log.OperationType.UPDATE)
    public R<Boolean> edit(@RequestBody CrmPoolConfig poolConfig) {
        requireManager();
        if (!poolConfigService.updatePool(poolConfig)) {
            throw new BusinessException("公海池不存在或内容未更新");
        }
        return R.ok(true);
    }

    @DeleteMapping("/{id}")
    @Log(module = "公海池配置", type = Log.OperationType.DELETE)
    public R<Boolean> remove(@PathVariable Long id) {
        requireManager();
        if (!poolConfigService.deletePool(id)) {
            throw new BusinessException("公海池不存在或未删除");
        }
        return R.ok(true);
    }

    @GetMapping("/by-type/{type}")
    public R<CrmPoolConfig> getByType(@PathVariable String type) {
        return R.ok(poolConfigService.getPoolByType(type));
    }

    private void requireManager() {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            throw new BusinessException("仅主管、老板或管理员可修改公海池配置");
        }
    }
}
