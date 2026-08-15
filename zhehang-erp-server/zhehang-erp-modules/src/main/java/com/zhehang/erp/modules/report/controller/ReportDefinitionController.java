package com.zhehang.erp.modules.report.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import com.zhehang.erp.modules.report.service.IReportDefinitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Report definition CRUD controller.
 */
@RestController
@RequestMapping("/report/definition")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
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
        IPage<ReportDefinition> page = definitionService.selectPage(pageNum, pageSize, name, category, type, status);
        if (!isPlatformAccount()) {
            List<ReportDefinition> visibleRecords = new java.util.ArrayList<>(page.getRecords());
            visibleRecords.removeIf(this::isCustomSql);
            page.setRecords(visibleRecords);
        }
        return R.ok(page);
    }

    @GetMapping("/category")
    public R<List<ReportDefinition>> listByCategory(@RequestParam(required = false) String category) {
        List<ReportDefinition> definitions = new java.util.ArrayList<>(definitionService.listByCategory(category));
        if (!isPlatformAccount()) {
            definitions.removeIf(this::isCustomSql);
        }
        return R.ok(definitions);
    }

    @GetMapping("/{id}")
    public R<ReportDefinition> getInfo(@PathVariable Long id) {
        ReportDefinition definition = definitionService.getById(id);
        assertReadable(definition);
        return R.ok(definition);
    }

    @PostMapping
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Definition", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody ReportDefinition definition) {
        definitionService.save(definition);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Definition", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody ReportDefinition definition) {
        definitionService.updateById(definition);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Definition", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        definitionService.removeById(id);
        return R.ok();
    }

    @PostMapping("/copy/{id}")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Definition", type = Log.OperationType.INSERT)
    public R<Long> copy(@PathVariable Long id) {
        return R.ok(definitionService.copyReport(id));
    }

    private void assertReadable(ReportDefinition definition) {
        if (definition != null && isCustomSql(definition) && !isPlatformAccount()) {
            throw new AccessDeniedException("自定义 SQL 报表仅平台管理员可访问");
        }
    }

    private boolean isCustomSql(ReportDefinition definition) {
        String type = definition == null ? null : definition.getDataSourceType();
        return "sql".equalsIgnoreCase(type) || "sqlQuery".equalsIgnoreCase(type);
    }

    private boolean isPlatformAccount() {
        return Long.valueOf(1L).equals(SecurityUtils.getCurrentUserId());
    }
}
