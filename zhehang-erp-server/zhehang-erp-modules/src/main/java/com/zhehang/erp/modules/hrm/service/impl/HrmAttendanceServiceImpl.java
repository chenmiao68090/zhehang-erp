package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmAttendance;
import com.zhehang.erp.modules.hrm.mapper.HrmAttendanceMapper;
import com.zhehang.erp.modules.hrm.service.IHrmAttendanceService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrmAttendanceServiceImpl extends ServiceImpl<HrmAttendanceMapper, HrmAttendance> implements IHrmAttendanceService {

    private final HrmAttendanceMapper attendanceMapper;
    private final DataScopeHelper dataScopeHelper;
    private static final LocalTime WORK_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);

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
        return stats;
    }
}