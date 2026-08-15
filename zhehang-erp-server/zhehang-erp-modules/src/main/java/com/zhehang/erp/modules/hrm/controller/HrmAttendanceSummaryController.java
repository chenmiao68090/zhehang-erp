package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmAttendanceSummary;
import com.zhehang.erp.modules.hrm.mapper.HrmAttendanceSummaryMapper;
import com.zhehang.erp.modules.hrm.service.IHrmAttendanceService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * HR·月度考勤汇总:按月生成(复用 monthlyStats)、HR 可改、员工二次确认。
 */
@RestController
@RequestMapping("/hrm/attendance-summary")
@RequiredArgsConstructor
public class HrmAttendanceSummaryController {

    private final HrmAttendanceSummaryMapper summaryMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final IHrmAttendanceService attendanceService;
    private final DataScopeHelper dataScopeHelper;
    private final IBizTaskService taskService;

    private static final int EMP_STATUS_RESIGNED = 3;

    /**
     * 生成/重算指定月份的考勤汇总:遍历非离职员工,复用 monthlyStats 落表。
     * 已进入确认流程(confirm_status>=1)的行跳过,避免覆盖 HR 已确认/员工已确认的数据。
     */
    @PostMapping("/generate")
    @Log(module = "考勤汇总", type = Log.OperationType.INSERT)
    public R<Integer> generate(@RequestParam String month) {
        if (!StringUtils.hasText(month)) {
            return R.fail("请选择月份");
        }
        if (!dataScopeHelper.isHrOrAdmin()) {
            return R.fail("仅 HR/管理员可生成考勤汇总");
        }
        List<OrgEmployee> emps = employeeMapper.selectList(
                new LambdaQueryWrapper<OrgEmployee>().ne(OrgEmployee::getStatus, EMP_STATUS_RESIGNED));
        int n = 0;
        for (OrgEmployee e : emps) {
            Map<String, Object> s = attendanceService.monthlyStats(e.getId(), month);
            HrmAttendanceSummary existing = summaryMapper.selectOne(new LambdaQueryWrapper<HrmAttendanceSummary>()
                    .eq(HrmAttendanceSummary::getEmployeeId, e.getId())
                    .eq(HrmAttendanceSummary::getMonth, month)
                    .last("limit 1"));
            if (existing != null && existing.getConfirmStatus() != null && existing.getConfirmStatus() >= 1) {
                continue; // 已确认/已发员工,不覆盖
            }
            HrmAttendanceSummary sum = existing != null ? existing : new HrmAttendanceSummary();
            sum.setEmployeeId(e.getId());
            sum.setEmployeeName(e.getName());
            sum.setMonth(month);
            sum.setExpectedDays(asInt(s.get("expectedDays")));
            sum.setPaidHolidayDays(asInt(s.get("paidHolidayDays")));
            sum.setActualDays(asInt(s.get("total")));
            sum.setNormal(asInt(s.get("normal")));
            sum.setLate(asInt(s.get("late")));
            sum.setEarly(asInt(s.get("early")));
            sum.setAbsent(asInt(s.get("absent")));
            sum.setPersonalLeave(asDecimal(s.get("personalLeave")));
            sum.setSickLeave(asDecimal(s.get("sickLeave")));
            if (sum.getConfirmStatus() == null) {
                sum.setConfirmStatus(0);
            }
            if (existing != null) {
                summaryMapper.updateById(sum);
            } else {
                try {
                    summaryMapper.insert(sum);
                } catch (org.springframework.dao.DuplicateKeyException dup) {
                    // 并发下另一线程已为该员工该月插入,唯一键挡住重复行,跳过即可
                    continue;
                }
            }
            n++;
        }
        return R.ok(n);
    }

    /** 汇总列表:HR/管理员看全部(数据范围内),普通员工只看自己。 */
    @GetMapping("/list")
    public R<List<HrmAttendanceSummary>> list(@RequestParam(required = false) String month) {
        LambdaQueryWrapper<HrmAttendanceSummary> qw = new LambdaQueryWrapper<HrmAttendanceSummary>()
                .eq(StringUtils.hasText(month), HrmAttendanceSummary::getMonth, month);
        if (!dataScopeHelper.isHrOrAdmin()) {
            Long myEmp = dataScopeHelper.currentEmployeeId();
            qw.eq(HrmAttendanceSummary::getEmployeeId, myEmp != null ? myEmp : -1L);
        }
        qw.orderByAsc(HrmAttendanceSummary::getEmployeeName).orderByAsc(HrmAttendanceSummary::getId);
        return R.ok(summaryMapper.selectList(qw));
    }

    /** HR 修改汇总(改数字/备注)。仅允许改未进入确认流程或自行决定的字段,简单起见全量 updateById。 */
    @PutMapping
    @Log(module = "考勤汇总", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmAttendanceSummary summary) {
        if (summary.getId() == null) {
            return R.fail("缺少汇总ID");
        }
        if (!dataScopeHelper.isHrOrAdmin()) {
            return R.fail("仅 HR/管理员可修改考勤汇总");
        }
        // 防伪造/越权:确认流程字段与归属字段不允许通过编辑接口改,只改考勤数字与HR备注
        summary.setConfirmStatus(null);
        summary.setConfirmBy(null);
        summary.setConfirmTime(null);
        summary.setEmployeeConfirmTime(null);
        summary.setEmployeeRemark(null);
        summary.setEmployeeId(null);
        summary.setEmployeeName(null);
        summary.setMonth(null);
        summaryMapper.updateById(summary);
        return R.ok();
    }

    /** HR 确认某条汇总并发送给员工二次确认(生成站内待办)。 */
    @PostMapping("/{id}/hr-confirm")
    @Log(module = "考勤汇总", type = Log.OperationType.UPDATE)
    public R<Void> hrConfirm(@PathVariable Long id) {
        if (!dataScopeHelper.isHrOrAdmin()) {
            return R.fail("仅 HR/管理员可确认");
        }
        HrmAttendanceSummary sum = summaryMapper.selectById(id);
        if (sum == null) {
            return R.fail("汇总不存在");
        }
        if (sum.getConfirmStatus() != null && sum.getConfirmStatus() != 0) {
            return R.fail("该汇总不在「待HR确认」状态,无需重复发送");
        }
        sum.setConfirmStatus(1);
        sum.setConfirmBy(dataScopeHelper.currentEmployeeId());
        sum.setConfirmTime(LocalDateTime.now());
        summaryMapper.updateById(sum);
        pushConfirmTask(sum);
        return R.ok();
    }

    /** HR 一键确认某月全部待确认汇总并发送员工。 */
    @PostMapping("/confirm-all")
    @Log(module = "考勤汇总", type = Log.OperationType.UPDATE)
    public R<Integer> confirmAll(@RequestParam String month) {
        if (!dataScopeHelper.isHrOrAdmin()) {
            return R.fail("仅 HR/管理员可确认");
        }
        List<HrmAttendanceSummary> rows = summaryMapper.selectList(new LambdaQueryWrapper<HrmAttendanceSummary>()
                .eq(HrmAttendanceSummary::getMonth, month)
                .eq(HrmAttendanceSummary::getConfirmStatus, 0));
        Long hrEmp = dataScopeHelper.currentEmployeeId();
        LocalDateTime now = LocalDateTime.now();
        for (HrmAttendanceSummary sum : rows) {
            sum.setConfirmStatus(1);
            sum.setConfirmBy(hrEmp);
            sum.setConfirmTime(now);
            summaryMapper.updateById(sum);
            pushConfirmTask(sum);
        }
        return R.ok(rows.size());
    }

    /** 员工二次确认(本人,状态须为HR已确认待员工)。 */
    @PostMapping("/{id}/employee-confirm")
    @Log(module = "考勤汇总", type = Log.OperationType.UPDATE)
    public R<Void> employeeConfirm(@PathVariable Long id) {
        return employeeAct(id, 2, null);
    }

    /** 员工提出异议(本人,带说明)。 */
    @PostMapping("/{id}/employee-dispute")
    @Log(module = "考勤汇总", type = Log.OperationType.UPDATE)
    public R<Void> employeeDispute(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String remark = body.get("remark") == null ? "" : String.valueOf(body.get("remark")).trim();
        return employeeAct(id, 3, remark);
    }

    private R<Void> employeeAct(Long id, int targetStatus, String remark) {
        HrmAttendanceSummary sum = summaryMapper.selectById(id);
        if (sum == null) {
            return R.fail("汇总不存在");
        }
        Long myEmp = dataScopeHelper.currentEmployeeId();
        if (myEmp == null || !myEmp.equals(sum.getEmployeeId())) {
            return R.fail("只能确认自己的考勤汇总");
        }
        if (sum.getConfirmStatus() == null || sum.getConfirmStatus() != 1) {
            return R.fail("当前状态不可确认(需 HR 已确认待员工)");
        }
        sum.setConfirmStatus(targetStatus);
        sum.setEmployeeConfirmTime(LocalDateTime.now());
        if (remark != null) {
            sum.setEmployeeRemark(remark);
        }
        summaryMapper.updateById(sum);
        return R.ok();
    }

    /** 给该员工建一条站内待办,提醒去确认考勤汇总。失败不阻断 HR 确认。 */
    private void pushConfirmTask(HrmAttendanceSummary sum) {
        try {
            OrgEmployee emp = employeeMapper.selectById(sum.getEmployeeId());
            if (emp == null || emp.getUserId() == null) {
                return;
            }
            BizTask task = new BizTask();
            task.setTitle("考勤待确认:" + sum.getMonth());
            task.setTaskType("attendance_confirm");
            task.setBizType("attendance_summary");
            task.setBizId(sum.getId());
            task.setExecutorId(emp.getUserId());
            task.setExecutorName(emp.getName());
            task.setDescription("您的 " + sum.getMonth() + " 月考勤汇总已由 HR 核对,请进入【假勤管理→月度汇总】确认无误或提出异议。");
            taskService.createTask(task);
        } catch (Exception ignore) {
            // 待办创建失败不阻断 HR 确认
        }
    }

    private int asInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        try {
            return (int) Double.parseDouble(String.valueOf(o));
        } catch (Exception e) {
            return 0;
        }
    }

    private BigDecimal asDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        try {
            return new BigDecimal(String.valueOf(o));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
