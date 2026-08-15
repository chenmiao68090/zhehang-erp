package com.zhehang.erp.modules.report.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.report.domain.entity.ReportSchedule;
import com.zhehang.erp.modules.report.service.IReportScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Report subscription schedule controller.
 */
@RestController
@RequestMapping("/report/schedule")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
public class ReportScheduleController {

    private final IReportScheduleService scheduleService;

    @GetMapping("/{reportId}")
    public R<List<ReportSchedule>> list(@PathVariable Long reportId) {
        return R.ok(scheduleService.listByReportId(reportId));
    }

    @PostMapping
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Schedule", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody ReportSchedule schedule) {
        scheduleService.save(schedule);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Schedule", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody ReportSchedule schedule) {
        scheduleService.updateById(schedule);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
    @Log(module = "Report Schedule", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        scheduleService.removeById(id);
        return R.ok();
    }
}
