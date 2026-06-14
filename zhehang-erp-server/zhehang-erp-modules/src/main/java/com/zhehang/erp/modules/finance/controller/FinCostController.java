package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinCost;
import com.zhehang.erp.modules.finance.mapper.FinCostMapper;
import com.zhehang.erp.modules.finance.service.IFinCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 管理成本 Controller。实际路径 = /api + /finance/cost/... */
@RestController
@RequestMapping("/finance/cost")
@RequiredArgsConstructor
public class FinCostController {

    private final IFinCostService costService;
    private final FinCostMapper costMapper;

    @GetMapping("/list")
    public R<IPage<FinCost>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String ownerDept,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String status) {
        return R.ok(costService.costList(pageNum, pageSize, keyword, ownerDept, period, status));
    }

    @GetMapping("/{id}")
    public R<FinCost> detail(@PathVariable Long id) {
        return R.ok(costMapper.selectById(id));
    }

    @PostMapping
    @Log(module = "管理成本", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody FinCost entity) {
        entity.setId(null);
        return R.ok(costService.saveCost(entity));
    }

    @PutMapping
    @Log(module = "管理成本", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody FinCost entity) {
        return R.ok(costService.saveCost(entity));
    }

    @PutMapping("/{id}/status")
    @Log(module = "管理成本", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam String status) {
        costService.changeStatus(id, status);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "管理成本", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        costService.removeCost(id);
        return R.ok();
    }
}
