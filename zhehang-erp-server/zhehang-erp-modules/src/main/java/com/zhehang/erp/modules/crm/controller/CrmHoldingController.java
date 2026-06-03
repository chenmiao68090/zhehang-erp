package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmHoldingConfig;
import com.zhehang.erp.modules.crm.service.ICrmHoldingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crm/holding")
@RequiredArgsConstructor
public class CrmHoldingController {

    private final ICrmHoldingService holdingService;

    /** 持有上限配置列表(启用中) */
    @GetMapping("/config")
    public R<List<CrmHoldingConfig>> config() {
        return R.ok(holdingService.listEnabled());
    }

    @PostMapping("/config")
    @Log(module = "持有上限配置", type = Log.OperationType.INSERT)
    public R<Void> saveConfig(@RequestBody CrmHoldingConfig config) {
        holdingService.save(config);
        return R.ok();
    }

    @PutMapping("/config")
    @Log(module = "持有上限配置", type = Log.OperationType.UPDATE)
    public R<Void> updateConfig(@RequestBody CrmHoldingConfig config) {
        holdingService.updateById(config);
        return R.ok();
    }

    /** 当前持有情况 { current, max, rate }(userId 缺省取当前登录人) */
    @GetMapping("/current")
    public R<Map<String, Object>> current(@RequestParam(required = false) Long userId) {
        return R.ok(holdingService.currentHolding(userId));
    }

    /** 领取上限校验 { canClaim, reason? } */
    @GetMapping("/check-limit")
    public R<Map<String, Object>> checkLimit(@RequestParam(required = false) Long userId) {
        return R.ok(holdingService.checkLimit(userId));
    }
}
