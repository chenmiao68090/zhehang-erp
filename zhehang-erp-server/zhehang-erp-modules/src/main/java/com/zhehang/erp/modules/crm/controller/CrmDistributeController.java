package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmDistributeLog;
import com.zhehang.erp.modules.crm.service.ICrmDistributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crm/distribute")
@RequiredArgsConstructor
public class CrmDistributeController {

    private final ICrmDistributeService distributeService;

    @PostMapping("/auto")
    @Log(module = "线索分配", type = Log.OperationType.UPDATE)
    public R<Long> auto(@RequestBody Map<String, Long> params) {
        Long userId = distributeService.autoDistribute(params.get("leadId"), params.get("poolId"));
        return R.ok(userId);
    }

    @PostMapping("/manual")
    @Log(module = "线索分配", type = Log.OperationType.UPDATE)
    public R<Void> manual(@RequestBody Map<String, Long> params) {
        distributeService.manualDistribute(params.get("leadId"), params.get("toUserId"), params.get("operatorId"));
        return R.ok();
    }

    @PostMapping("/grab")
    @Log(module = "线索分配", type = Log.OperationType.UPDATE)
    public R<Boolean> grab(@RequestBody Map<String, Long> params) {
        boolean ok = distributeService.grabLead(params.get("leadId"), params.get("userId"));
        return R.ok(ok);
    }

    @GetMapping("/log")
    public R<List<CrmDistributeLog>> log(@RequestParam Long leadId) {
        return R.ok(distributeService.getDistributeLog(leadId));
    }

    @GetMapping("/weight-config")
    public R<Integer> getWeightConfig(@RequestParam Long userId) {
        return R.ok(distributeService.calculateWeight(userId));
    }

    @PostMapping("/weight-config")
    @Log(module = "线索分配", type = Log.OperationType.UPDATE)
    public R<Void> saveWeightConfig(@RequestBody Map<String, Object> params) {
        // 权重配置保存(预留扩展接口)
        return R.ok();
    }
}
