package com.zhehang.erp.modules.report.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Report definition entity.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("report_definition")
public class ReportDefinition extends BaseEntity {
    /** Report name. */
    private String name;
    /** Category: crm/finance/hrm/sales/supply/other. */
    private String category;
    /** Report type: table/chart/dashboard. */
    private String type;
    /** Data source type: sql/preset. */
    private String dataSourceType;
    /** SQL query (or preset key). */
    private String sqlQuery;
    /** Chart configuration JSON. */
    private String chartConfig;
    /** Filter configuration JSON. */
    private String filterConfig;
    /** Permission type: public/private/role. */
    private String permissionType;
    /** Status: 0 draft / 1 published. */
    private Integer status;
    /** Description. */
    private String description;
}
