package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 任务进度汇报
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task_progress_report")
public class BizTaskProgressReport extends BaseEntity {
    /** 任务ID */
    private Long taskId;
    /** 汇报人用户ID */
    private Long reporterId;
    /** 汇报人姓名 */
    private String reporterName;
    /** 汇报内容 */
    private String content;
    /** 汇报时间 */
    private LocalDateTime reportTime;
}
