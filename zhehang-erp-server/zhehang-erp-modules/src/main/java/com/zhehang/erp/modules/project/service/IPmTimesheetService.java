package com.zhehang.erp.modules.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.project.domain.entity.PmTimesheet;

import java.math.BigDecimal;
import java.util.Map;

public interface IPmTimesheetService extends IService<PmTimesheet> {
    IPage<PmTimesheet> selectPage(int pageNum, int pageSize, Long projectId, Long taskId, Long employeeId);
    Map<String, BigDecimal> getStats(Long projectId);
}
