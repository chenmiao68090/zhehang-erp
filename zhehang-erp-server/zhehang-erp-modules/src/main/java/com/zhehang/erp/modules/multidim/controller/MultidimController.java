package com.zhehang.erp.modules.multidim.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.multidim.domain.dto.FieldDef;
import com.zhehang.erp.modules.multidim.domain.dto.ViewDef;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTable;
import com.zhehang.erp.modules.multidim.service.IMultidimTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/multidim/table")
@RequiredArgsConstructor
public class MultidimController {

    private final IMultidimTableService tableService;

    @GetMapping("/list")
    public R<IPage<MultidimTable>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        return R.ok(tableService.selectPage(pageNum, pageSize, name, category));
    }

    @GetMapping("/{id}")
    public R<MultidimTable> getInfo(@PathVariable Long id) {
        return R.ok(tableService.getById(id));
    }

    @PostMapping
    @Log(module = "多维表格", type = Log.OperationType.INSERT)
    public R<MultidimTable> add(@RequestBody MultidimTable table) {
        tableService.save(table);
        return R.ok(table);
    }

    @PutMapping
    @Log(module = "多维表格", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody MultidimTable table) {
        tableService.updateById(table);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "多维表格", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        tableService.removeById(id);
        return R.ok();
    }

    @PostMapping("/fromTemplate")
    @Log(module = "多维表格", type = Log.OperationType.INSERT)
    public R<MultidimTable> createFromTemplate(@RequestBody Map<String, Object> params) {
        Long templateId = Long.valueOf(params.get("templateId").toString());
        String name = params.get("name") != null ? params.get("name").toString() : null;
        return R.ok(tableService.createFromTemplate(templateId, name));
    }

    @PostMapping("/copy/{id}")
    @Log(module = "多维表格", type = Log.OperationType.INSERT)
    public R<MultidimTable> copy(@PathVariable Long id) {
        return R.ok(tableService.copyTable(id));
    }

    @PostMapping("/{tableId}/field")
    public R<Void> addField(@PathVariable Long tableId, @RequestBody FieldDef field) {
        tableService.addField(tableId, field);
        return R.ok();
    }

    @PutMapping("/{tableId}/field")
    public R<Void> updateField(@PathVariable Long tableId, @RequestBody FieldDef field) {
        tableService.updateField(tableId, field);
        return R.ok();
    }

    @DeleteMapping("/{tableId}/field/{fieldId}")
    public R<Void> deleteField(@PathVariable Long tableId, @PathVariable String fieldId) {
        tableService.deleteField(tableId, fieldId);
        return R.ok();
    }

    @PostMapping("/{tableId}/view")
    public R<Void> addView(@PathVariable Long tableId, @RequestBody ViewDef view) {
        tableService.addView(tableId, view);
        return R.ok();
    }

    @PutMapping("/{tableId}/view")
    public R<Void> updateView(@PathVariable Long tableId, @RequestBody ViewDef view) {
        tableService.updateView(tableId, view);
        return R.ok();
    }

    @DeleteMapping("/{tableId}/view/{viewId}")
    public R<Void> deleteView(@PathVariable Long tableId, @PathVariable String viewId) {
        tableService.deleteView(tableId, viewId);
        return R.ok();
    }
}
