package com.zhehang.erp.modules.report.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.report.domain.entity.ReportDataset;

import java.util.List;
import java.util.Map;

public interface IReportDatasetService extends IService<ReportDataset> {
    /** Execute report query (preset or custom SQL). */
    List<Map<String, Object>> executeReport(Long reportId, Map<String, Object> params);

    /** List preset data sources. */
    List<Map<String, Object>> listPresetDataSources();

    /** List datasets bound to a report id. */
    List<ReportDataset> listByReportId(Long reportId);
}
