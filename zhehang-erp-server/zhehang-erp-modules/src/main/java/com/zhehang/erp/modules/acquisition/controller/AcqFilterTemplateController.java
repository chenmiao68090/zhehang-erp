package com.zhehang.erp.modules.acquisition.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqFilterTemplate;
import com.zhehang.erp.modules.acquisition.service.IAcqFilterTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/acquisition/filter-template")
@RequiredArgsConstructor
public class AcqFilterTemplateController {

    private final IAcqFilterTemplateService filterTemplateService;

    @GetMapping("/list")
    public R<List<AcqFilterTemplate>> list(@RequestParam(required = false) Long userId) {
        return R.ok(filterTemplateService.listByUser(userId));
    }

    @PostMapping
    public R<Void> save(@RequestBody AcqFilterTemplate template) {
        filterTemplateService.saveTemplate(template);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> remove(@PathVariable Long id) {
        filterTemplateService.removeById(id);
        return R.ok();
    }
}
