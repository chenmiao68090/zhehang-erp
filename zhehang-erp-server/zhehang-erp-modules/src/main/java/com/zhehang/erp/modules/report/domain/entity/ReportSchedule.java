package com.zhehang.erp.modules.report.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Report subscription / scheduled task entity.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("report_schedule")
public class ReportSchedule extends BaseEntity {
    /** Linked report id. */
    private Long reportId;
    /** Cron expression. */
    private String cronExpression;
    /** Recipients (comma separated). */
    private String recipients;
    /** Push channel: email/sms/im. */
    private String channel;
    /** Status: 0 disabled / 1 enabled. */
    private Integer status;
    /** Description. */
    private String description;
}
