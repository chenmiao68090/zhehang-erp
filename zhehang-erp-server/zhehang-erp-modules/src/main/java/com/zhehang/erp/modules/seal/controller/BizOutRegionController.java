package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizOutRegion;
import com.zhehang.erp.modules.seal.mapper.BizOutRegionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 刻章·外区域合作(浙江省内、杭州以外的备案/刻章合作商名录)。
 */
@RestController
@RequestMapping("/seal/out-region")
@RequiredArgsConstructor
public class BizOutRegionController {

    private final BizOutRegionMapper mapper;

    @GetMapping("/list")
    public R<List<BizOutRegion>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<BizOutRegion> qw = new LambdaQueryWrapper<BizOutRegion>()
                .like(StringUtils.hasText(keyword), BizOutRegion::getCity, keyword)
                .orderByDesc(BizOutRegion::getId);
        return R.ok(mapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "外区域合作", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody BizOutRegion entity) {
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "外区域合作", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
