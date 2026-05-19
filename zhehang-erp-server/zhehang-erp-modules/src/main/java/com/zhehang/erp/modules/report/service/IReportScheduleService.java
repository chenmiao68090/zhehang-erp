package com.zhehang.erp.modules.report.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.report.domain.entity.ReportSchedule;

import java.util.List;

public interface IReportScheduleService extends IService<ReportSchedule> {
    /** List schedules by report id. */
    List<ReportSchedule> listByReportId(Long reportId);
}
