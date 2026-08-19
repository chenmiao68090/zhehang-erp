package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerformance;
import com.zhehang.erp.modules.hrm.service.IHrmPerformanceService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/hrm/performance")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('hrm')")
public class HrmPerformanceController {

    private final IHrmPerformanceService performanceService;
    private final DataScopeHelper dataScopeHelper;

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
        // 绩效新建限HR/管理员/老板(HR为员工建档)
        if (!dataScopeHelper.hasPerm("hr:performance:manage")) {
            return R.fail("无权新建绩效,仅HR/管理员可操作");
        }
        performance.setStatus(0);
        performanceService.save(performance);
        return R.ok();
    }

    @PutMapping
    @Log(module = "绩效管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmPerformance performance) {
        // 绩效编辑限管理层
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        performanceService.updateById(performance);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "绩效管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        // 绩效删除限HR/管理员/老板
        if (!dataScopeHelper.hasPerm("hr:performance:manage")) {
            return R.fail("无权删除绩效");
        }
        performanceService.removeById(id);
        return R.ok();
    }

    @PutMapping("/evaluate")
    @Log(module = "绩效管理", type = Log.OperationType.UPDATE)
    public R<Void> evaluate(@RequestBody Map<String, Object> params) {
        // 主管评分限管理员/主管
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权评分,仅管理员/主管可操作");
        }
        if (params.get("id") == null) {
            return R.fail("缺少绩效ID");
        }
        if (params.get("selfScore") == null) {
            return R.fail("缺少自评分");
        }
        if (params.get("leaderScore") == null) {
            return R.fail("缺少主管评分");
        }
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