package com.zhehang.erp.modules.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.admin.domain.AdminSealUse;
import com.zhehang.erp.modules.admin.mapper.AdminSealUseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 行政·印章登记(用印申请闭环)。
 */
@RestController
@RequestMapping("/admin/seal-use")
@RequiredArgsConstructor
public class AdminSealUseController {

    private final AdminSealUseMapper mapper;

    @GetMapping("/list")
    public R<List<AdminSealUse>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<AdminSealUse> qw = new LambdaQueryWrapper<AdminSealUse>()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(AdminSealUse::getSerialNo, keyword)
                        .or().like(AdminSealUse::getApplicant, keyword)
                        .or().like(AdminSealUse::getFileName, keyword)
                        .or().like(AdminSealUse::getReason, keyword))
                .orderByDesc(AdminSealUse::getId);
        return R.ok(mapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "印章登记", type = Log.OperationType.OTHER)
    public R<Void> save(@RequestBody AdminSealUse entity) {
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "印章登记", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
