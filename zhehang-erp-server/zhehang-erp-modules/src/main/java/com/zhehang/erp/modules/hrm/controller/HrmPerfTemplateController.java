package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerfTemplate;
import com.zhehang.erp.modules.hrm.mapper.HrmPerfTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HR·绩效考核模板(参考 tita,按岗位设考核模板)。
 */
@RestController
@RequestMapping("/hrm/perf-template")
@RequiredArgsConstructor
public class HrmPerfTemplateController {

    private final HrmPerfTemplateMapper mapper;

    @GetMapping("/list")
    public R<List<HrmPerfTemplate>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<HrmPerfTemplate> qw = new LambdaQueryWrapper<HrmPerfTemplate>()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(HrmPerfTemplate::getTemplateName, keyword)
                        .or().like(HrmPerfTemplate::getPostName, keyword))
                .orderByDesc(HrmPerfTemplate::getId);
        return R.ok(mapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "绩效考核模板", type = Log.OperationType.OTHER)
    public R<Void> save(@RequestBody HrmPerfTemplate entity) {
        if (!StringUtils.hasText(entity.getTemplateName())) {
            return R.fail("请填写模板名称");
        }
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "绩效考核模板", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
