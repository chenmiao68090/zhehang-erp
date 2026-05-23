package com.zhehang.erp.modules.report.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.report.domain.entity.ReportSchedule;
import com.zhehang.erp.modules.report.service.IReportScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Report subscription schedule controller.
 */
@RestController
@RequestMapping("/report/schedule")
@RequiredArgsConstructor
public class ReportScheduleController {

    private final IReportScheduleService scheduleService;

    @GetMapping("/{reportId}")
    public R<List<ReportSchedule>> list(@PathVariable Long reportId) {
        return R.ok(scheduleService.listByReportId(reportId));
    }

    @PostMapping
    @Log(module = "Report Schedule", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody ReportSchedule schedule) {
        scheduleService.save(schedule);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Report Schedule", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody ReportSchedule schedule) {
        scheduleService.updateById(schedule);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Report Schedule", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        scheduleService.removeById(id);
        return R.ok();
    }
}
