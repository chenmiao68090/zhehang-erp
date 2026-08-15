package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmAttendance;
import com.zhehang.erp.modules.hrm.service.IHrmAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/attendance")
@RequiredArgsConstructor
public class HrmAttendanceController {

    private final IHrmAttendanceService attendanceService;

    @GetMapping("/list")
    public R<IPage<HrmAttendance>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String month) {
        return R.ok(attendanceService.selectPage(pageNum, pageSize, employeeId, month));
    }

    @PostMapping("/clock-in")
    @Log(module = "考勤管理", type = Log.OperationType.INSERT)
    public R<HrmAttendance> clockIn(@RequestBody Map<String, Long> params) {
        if (params.get("employeeId") == null) {
            return R.fail("缺少员工ID");
        }
        return R.ok(attendanceService.clockIn(params.get("employeeId")));
    }

    @PostMapping("/clock-out")
    @Log(module = "考勤管理", type = Log.OperationType.UPDATE)
    public R<HrmAttendance> clockOut(@RequestBody Map<String, Long> params) {
        if (params.get("employeeId") == null) {
            return R.fail("缺少员工ID");
        }
        return R.ok(attendanceService.clockOut(params.get("employeeId")));
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> monthlyStats(
            @RequestParam Long employeeId,
            @RequestParam String month) {
        return R.ok(attendanceService.monthlyStats(employeeId, month));
    }
}