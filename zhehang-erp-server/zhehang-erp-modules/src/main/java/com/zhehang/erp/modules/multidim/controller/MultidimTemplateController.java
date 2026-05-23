package com.zhehang.erp.modules.multidim.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTemplate;
import com.zhehang.erp.modules.multidim.service.IMultidimTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/multidim/template")
@RequiredArgsConstructor
public class MultidimTemplateController {

    private final IMultidimTemplateService templateService;

    @GetMapping("/list")
    public R<List<MultidimTemplate>> list(@RequestParam(required = false) String category) {
        return R.ok(templateService.listByCategory(category));
    }

    @GetMapping("/{id}")
    public R<MultidimTemplate> getInfo(@PathVariable Long id) {
        return R.ok(templateService.getById(id));
    }
}
