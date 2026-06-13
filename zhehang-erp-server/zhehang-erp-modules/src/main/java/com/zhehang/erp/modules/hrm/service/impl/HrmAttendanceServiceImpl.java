package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmAttendance;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeave;
import com.zhehang.erp.modules.hrm.mapper.HrmAttendanceMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveMapper;
import com.zhehang.erp.modules.hrm.service.IHrmAttendanceService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrmAttendanceServiceImpl extends ServiceImpl<HrmAttendanceMapper, HrmAttendance> implements IHrmAttendanceService {

    private final HrmAttendanceMapper attendanceMapper;
    private final HrmLeaveMapper leaveMapper;
    private final DataScopeHelper dataScopeHelper;
    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);
    // 请假类型枚举(与前端 attendance.vue 选项保持一致):2=病假,3=事假
    private static final int LEAVE_TYPE_SICK = 2;
    private static final int LEAVE_TYPE_PERSONAL = 3;
    // 请假审批状态:1=已通过(只统计已通过的请假)
    private static final int LEAVE_STATUS_APPROVED = 1;

    @Override
    public IPage<HrmAttendance> selectPage(int pageNum, int pageSize, Long employeeId, String month) {
        // 数据权限:非HR/管理员只能看自己的考勤记录
        if (!dataScopeHelper.isHrOrAdmin()) {
            Long myEmp = dataScopeHelper.currentEmployeeId();
            employeeId = (myEmp != null ? myEmp : -1L);
        }
        LambdaQueryWrapper<HrmAttendance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(employeeId != null, HrmAttendance::getEmployeeId, employeeId)
               .likeRight(StringUtils.hasText(month), HrmAttendance::getAttendanceDate, month)
               .orderByDesc(HrmAttendance::getAttendanceDate);
        return attendanceMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public HrmAttendance clockIn(Long employeeId) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<HrmAttendance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmAttendance::getEmployeeId, employeeId)
               .eq(HrmAttendance::getAttendanceDate, today);
        HrmAttendance attendance = attendanceMapper.selectOne(wrapper);
        if (attendance != null && attendance.getClockIn() != null) {
            throw new BusinessException("今日已打卡");
        }
        if (attendance == null) {
            attendance = new HrmAttendance();
            attendance.setEmployeeId(employeeId);
            attendance.setAttendanceDate(today);
        }
        LocalTime now = LocalTime.now();
        attendance.setClockIn(now);
        attendance.setStatus(now.isAfter(WORK_START) ? 1 : 0);
        if (attendance.getId() == null) {
            attendanceMapper.insert(attendance);
        } else {
            attendanceMapper.updateById(attendance);
        }
        return attendance;
    }

    @Override
    public HrmAttendance clockOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        LambdaQueryWrapper<HrmAttendance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmAttendance::getEmployeeId, employeeId)
               .eq(HrmAttendance::getAttendanceDate, today);
        HrmAttendance attendance = attendanceMapper.selectOne(wrapper);
        if (attendance == null) {
            throw new BusinessException("请先上班打卡");
        }
        LocalTime now = LocalTime.now();
        attendance.setClockOut(now);
        if (now.isBefore(WORK_END)) {
            attendance.setStatus(2);
        }
        if (attendance.getClockIn() != null) {
            long minutes = ChronoUnit.MINUTES.between(attendance.getClockIn(), now);
            attendance.setWorkHours(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP));
        }
        attendanceMapper.updateById(attendance);
        return attendance;
    }

    @Override
    public Map<String, Object> monthlyStats(Long employeeId, String month) {
        LambdaQueryWrapper<HrmAttendance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmAttendance::getEmployeeId, employeeId)
               .likeRight(HrmAttendance::getAttendanceDate, month);
        List<HrmAttendance> list = attendanceMapper.selectList(wrapper);
        int normal = 0, late = 0, early = 0, absent = 0;
        for (HrmAttendance a : list) {
            switch (a.getStatus()) {
                case 0: normal++; break;
                case 1: late++; break;
                case 2: early++; break;
                case 3: absent++; break;
            }
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("normal", normal);
        stats.put("late", late);
        stats.put("early", early);
        stats.put("absent", absent);
        stats.put("total", list.size());
        // 新增字段:应出勤天数(当月工作日:周一~周五)
        stats.put("expectedDays", workdaysOfMonth(month));
        // 新增字段:事假/病假天数(关联 hrm_leave,仅统计已通过且开始时间落在当月的请假)
        stats.put("personalLeave", leaveDaysOfMonth(employeeId, month, LEAVE_TYPE_PERSONAL));
        stats.put("sickLeave", leaveDaysOfMonth(employeeId, month, LEAVE_TYPE_SICK));
        return stats;
    }

    /**
     * 计算指定月份的工作日数(周一~周五)。
     * month 形如 "2026-06";解析失败时返回 0,保证接口不抛异常。
     */
    private int workdaysOfMonth(String month) {
        YearMonth ym;
        try {
            ym = YearMonth.parse(month);
        } catch (Exception e) {
            return 0;
        }
        int count = 0;
        LocalDate cursor = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        while (!cursor.isAfter(end)) {
            DayOfWeek dow = cursor.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            cursor = cursor.plusDays(1);
        }
        return count;
    }

    /**
     * 统计某员工在指定月份、指定请假类型下已通过的请假天数(累加 hrm_leave.duration)。
     * 以请假开始时间(startTime)是否落在当月为口径。
     */
    private BigDecimal leaveDaysOfMonth(Long employeeId, String month, int leaveType) {
        if (employeeId == null) {
            return BigDecimal.ZERO;
        }
        YearMonth ym;
        try {
            ym = YearMonth.parse(month);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
        LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = ym.atEndOfMonth().atTime(LocalTime.MAX);
        LambdaQueryWrapper<HrmLeave> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmLeave::getEmployeeId, employeeId)
               .eq(HrmLeave::getLeaveType, leaveType)
               .eq(HrmLeave::getStatus, LEAVE_STATUS_APPROVED)
               .ge(HrmLeave::getStartTime, monthStart)
               .le(HrmLeave::getStartTime, monthEnd);
        List<HrmLeave> leaves = leaveMapper.selectList(wrapper);
        BigDecimal total = BigDecimal.ZERO;
        for (HrmLeave l : leaves) {
            if (l.getDuration() != null) {
                total = total.add(l.getDuration());
            }
        }
        return total;
    }
}