package com.zhehang.erp.modules.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmTimesheet;
import com.zhehang.erp.modules.project.service.IPmTimesheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/project/timesheet")
@RequiredArgsConstructor
public class TimesheetController {

    private final IPmTimesheetService timesheetService;

    @GetMapping("/list")
    public R<IPage<PmTimesheet>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long employeeId) {
        return R.ok(timesheetService.selectPage(pageNum, pageSize, projectId, taskId, employeeId));
    }

    @PostMapping
    @Log(module = "宸ユ椂璁板綍", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmTimesheet timesheet) {
        timesheetService.save(timesheet);
        return R.ok();
    }

    @PutMapping
    @Log(module = "宸ユ椂璁板綍", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody PmTimesheet timesheet) {
        timesheetService.updateById(timesheet);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "宸ユ椂璁板綍", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        timesheetService.removeById(id);
        return R.ok();
    }

    @GetMapping("/stats")
    public R<Map<String, BigDecimal>> stats(@RequestParam Long projectId) {
        return R.ok(timesheetService.getStats(projectId));
    }
}
