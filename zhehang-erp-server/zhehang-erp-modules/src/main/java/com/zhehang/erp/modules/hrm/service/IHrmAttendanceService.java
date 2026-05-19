package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmAttendance;

import java.util.Map;

public interface IHrmAttendanceService extends IService<HrmAttendance> {
    IPage<HrmAttendance> selectPage(int pageNum, int pageSize, Long employeeId, String month);
    HrmAttendance clockIn(Long employeeId);
    HrmAttendance clockOut(Long employeeId);
    Map<String, Object> monthlyStats(Long employeeId, String month);
}
