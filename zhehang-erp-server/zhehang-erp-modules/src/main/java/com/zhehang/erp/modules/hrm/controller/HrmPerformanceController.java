package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerformance;
import com.zhehang.erp.modules.hrm.service.IHrmPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/hrm/performance")
@RequiredArgsConstructor
public class HrmPerformanceController {

    private final IHrmPerformanceService performanceService;

    @GetMapping("/list")
    public R<IPage<HrmPerformance>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Integer status) {
        return R.ok(performanceService.selectPage(pageNum, pageSize, employeeId, period, type, status));
    }

    @PostMapping
    @Log(module = "绩效管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmPerformance performance) {
        performance.setStatus(0);
        performanceService.save(performance);
        return R.ok();
    }

    @PutMapping
    @Log(module = "绩效管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmPerformance performance) {
        performanceService.updateById(performance);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "绩效管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        performanceService.removeById(id);
        return R.ok();
    }

    @PutMapping("/evaluate")
    @Log(module = "绩效管理", type = Log.OperationType.UPDATE)
    public R<Void> evaluate(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        BigDecimal selfScore = new BigDecimal(params.get("selfScore").toString());
        BigDecimal leaderScore = new BigDecimal(params.get("leaderScore").toString());
        String evaluation = params.get("evaluation") != null ? params.get("evaluation").toString() : "";
        performanceService.evaluate(id, selfScore, leaderScore, evaluation);
        return R.ok();
    }

    @GetMapping("/statistics")
    public R<Map<String, Object>> statistics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer type) {
        return R.ok(performanceService.statistics(period, type));
    }
}