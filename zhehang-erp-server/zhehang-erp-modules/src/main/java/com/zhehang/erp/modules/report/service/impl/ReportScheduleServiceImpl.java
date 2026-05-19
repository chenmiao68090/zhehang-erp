package com.zhehang.erp.modules.report.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.report.domain.entity.ReportSchedule;
import com.zhehang.erp.modules.report.mapper.ReportScheduleMapper;
import com.zhehang.erp.modules.report.service.IReportScheduleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportScheduleServiceImpl extends ServiceImpl<ReportScheduleMapper, ReportSchedule>
        implements IReportScheduleService {

    @Override
    public List<ReportSchedule> listByReportId(Long reportId) {
        LambdaQueryWrapper<ReportSchedule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReportSchedule::getReportId, reportId)
               .orderByDesc(ReportSchedule::getCreateTime);
        return this.list(wrapper);
    }
}
