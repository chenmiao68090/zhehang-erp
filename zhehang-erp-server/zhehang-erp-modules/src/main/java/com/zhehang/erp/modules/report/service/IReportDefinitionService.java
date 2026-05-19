package com.zhehang.erp.modules.report.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;

import java.util.List;

public interface IReportDefinitionService extends IService<ReportDefinition> {
    /** Paged query of report definitions. */
    IPage<ReportDefinition> selectPage(int pageNum, int pageSize, String name, String category, String type, Integer status);

    /** List by category. */
    List<ReportDefinition> listByCategory(String category);

    /** Copy a report; returns the new id. */
    Long copyReport(Long sourceId);
}
