package com.zhehang.erp.modules.report.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.report.domain.entity.ReportDataset;
import com.zhehang.erp.modules.report.service.IReportDatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Report data execution and dataset management controller.
 */
@RestController
@RequestMapping("/report/data")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
public class ReportDataController {

    private final IReportDatasetService datasetService;

    @GetMapping("/execute/{id}")
    @Log(module = "Report Data", type = Log.OperationType.QUERY)
    public R<List<Map<String, Object>>> execute(@PathVariable Long id) {
        return R.ok(datasetService.executeReport(id));
    }

    @GetMapping("/preset")
    public R<List<Map<String, Object>>> listPreset() {
        return R.ok(datasetService.listPresetDataSources());
    }

    @GetMapping("/dataset/{reportId}")
    public R<List<ReportDataset>> listDatasets(@PathVariable Long reportId) {
        return R.ok(datasetService.listByReportId(reportId));
    }

    @PostMapping("/dataset")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Dataset", type = Log.OperationType.INSERT)
    public R<Void> addDataset(@RequestBody ReportDataset dataset) {
        datasetService.save(dataset);
        return R.ok();
    }

    @PutMapping("/dataset")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Dataset", type = Log.OperationType.UPDATE)
    public R<Void> updateDataset(@RequestBody ReportDataset dataset) {
        datasetService.updateById(dataset);
        return R.ok();
    }

    @DeleteMapping("/dataset/{id}")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Dataset", type = Log.OperationType.DELETE)
    public R<Void> removeDataset(@PathVariable Long id) {
        datasetService.removeById(id);
        return R.ok();
    }
}
