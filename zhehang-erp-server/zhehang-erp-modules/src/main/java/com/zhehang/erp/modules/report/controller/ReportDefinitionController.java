package com.zhehang.erp.modules.report.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import com.zhehang.erp.modules.report.service.IReportDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Report definition CRUD controller.
 */
@RestController
@RequestMapping("/report/definition")
@RequiredArgsConstructor
public class ReportDefinitionController {

    private final IReportDefinitionService definitionService;

    @GetMapping("/list")
    public R<IPage<ReportDefinition>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        return R.ok(definitionService.selectPage(pageNum, pageSize, name, category, type, status));
    }

    @GetMapping("/category")
    public R<List<ReportDefinition>> listByCategory(@RequestParam(required = false) String category) {
        return R.ok(definitionService.listByCategory(category));
    }

    @GetMapping("/{id}")
    public R<ReportDefinition> getInfo(@PathVariable Long id) {
        return R.ok(definitionService.getById(id));
    }

    @PostMapping
    @Log(module = "Report Definition", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody ReportDefinition definition) {
        definitionService.save(definition);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Report Definition", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody ReportDefinition definition) {
        definitionService.updateById(definition);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Report Definition", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        definitionService.removeById(id);
        return R.ok();
    }

    @PostMapping("/copy/{id}")
    @Log(module = "Report Definition", type = Log.OperationType.INSERT)
    public R<Long> copy(@PathVariable Long id) {
        return R.ok(definitionService.copyReport(id));
    }
}
