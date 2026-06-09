package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 任务实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task")
public class BizTask extends BaseEntity {
    /** 任务编号 */
    private String taskNo;
    /** 任务标题 */
    private String title;
    /** 任务类型(handover交接 service服务 followup跟进 audit审计 other其他) */
    private String taskType;
    /** 关联业务ID(如订单/合同) */
    private Long bizId;
    /** 关联业务类型 */
    private String bizType;
    /** 客户ID */
    private Long customerId;
    /** 优先级(1低 2中 3高 4紧急) */
    private Integer priority;
    /** 执行人ID */
    private Long executorId;
    /** 执行人姓名 */
    private String executorName;
    /** 归属交付部门ID(指派时按执行人部门写入,供"主管只看本部门任务") */
    private Long deptId;
    /** 创建人/指派人ID */
    private Long assignerId;
    /** 计划开始时间 */
    private LocalDateTime planStartTime;
    /** 计划完成时间 */
    private LocalDateTime planEndTime;
    /** 实际开始时间 */
    private LocalDateTime actualStartTime;
    /** 实际完成时间 */
    private LocalDateTime actualEndTime;
    /** 状态(1待指派 2待执行 3执行中 4待验收 5已完成 6已驳回 7已取消) */
    private Integer status;
    /** 任务描述 */
    private String description;
    /** 完成结果 */
    private String result;
    /** 验收意见 */
    private String reviewComment;
    /** 验收人ID */
    private Long reviewerId;
    /** 验收时间 */
    private LocalDateTime reviewTime;
    /** 附件 */
    private String attachments;
    /** 备注 */
    private String remark;
}
