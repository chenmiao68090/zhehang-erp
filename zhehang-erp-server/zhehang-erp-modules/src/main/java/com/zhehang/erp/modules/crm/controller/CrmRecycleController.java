package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmRecycleRule;
import com.zhehang.erp.modules.crm.service.ICrmRecycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crm/recycle")
@RequiredArgsConstructor
public class CrmRecycleController {

    private final ICrmRecycleService recycleService;

    @PostMapping("/scan")
    @Log(module = "线索回收", type = Log.OperationType.UPDATE)
    public R<Integer> scan() {
        return R.ok(recycleService.scanAndRecycle());
    }

    @PostMapping("/manual")
    @Log(module = "线索回收", type = Log.OperationType.UPDATE)
    @SuppressWarnings("unchecked")
    public R<Integer> manual(@RequestBody Map<String, Object> params) {
        List<Long> leadIds = ((List<Number>) params.getOrDefault("leadIds", java.util.Collections.emptyList()))
                .stream().map(Number::longValue).collect(java.util.stream.Collectors.toList());
        String reason = (String) params.get("reason");
        return R.ok(recycleService.manualRecycle(leadIds, reason));
    }

    @GetMapping("/warning")
    public R<List<CrmLead>> warning(@RequestParam(required = false) String level) {
        return R.ok(recycleService.getWarningList(level));
    }

    @GetMapping("/rules")
    public R<List<CrmRecycleRule>> rules() {
        return R.ok(recycleService.getRules());
    }

    @PostMapping("/rules")
    @Log(module = "线索回收", type = Log.OperationType.UPDATE)
    public R<Boolean> saveRule(@RequestBody CrmRecycleRule rule) {
        return R.ok(recycleService.saveRule(rule));
    }

    @GetMapping("/log")
    public R<List<CrmRecycleRule>> log() {
        // 复用规则列表作为操作记录入口
        return R.ok(recycleService.getRules());
    }
}
