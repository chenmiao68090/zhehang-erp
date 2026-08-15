package com.zhehang.erp.modules.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.admin.domain.AdminSupply;
import com.zhehang.erp.modules.admin.mapper.AdminSupplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 行政·办公用品管理(分类物料台账 + 入库采购)。
 */
@RestController
@RequestMapping("/admin/supply")
@RequiredArgsConstructor
public class AdminSupplyController {

    private final AdminSupplyMapper mapper;

    @GetMapping("/list")
    public R<List<AdminSupply>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<AdminSupply> qw = new LambdaQueryWrapper<AdminSupply>()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(AdminSupply::getSupplyName, keyword)
                        .or().like(AdminSupply::getSupplyNo, keyword)
                        .or().like(AdminSupply::getCategory, keyword)
                        .or().like(AdminSupply::getOperator, keyword))
                .orderByDesc(AdminSupply::getId);
        return R.ok(mapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "办公用品", type = Log.OperationType.OTHER)
    public R<Void> save(@RequestBody AdminSupply entity) {
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "办公用品", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
