package com.zhehang.erp.modules.report.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Report dataset entity.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("report_dataset")
public class ReportDataset extends BaseEntity {
    /** Linked report id. */
    private Long reportId;
    /** Dataset name. */
    private String datasetName;
    /** Data source key (preset key or custom sql identifier). */
    private String dataSource;
    /** Query configuration JSON. */
    private String queryConfig;
    /** Description. */
    private String description;
}
