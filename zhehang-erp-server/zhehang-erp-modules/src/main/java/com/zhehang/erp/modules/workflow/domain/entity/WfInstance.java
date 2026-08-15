package com.zhehang.erp.modules.workflow.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 流程实例实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wf_instance")
public class WfInstance extends BaseEntity {
    /** 流程定义ID */
    private Long processDefId;
    /** 绑定的流程版本快照ID(发起时定格,在途永远读快照,改定义不影响在途单) */
    private Long processVersionId;
    /** 关联业务类型(hrm_leave/fin_reimburse/org_transfer…;空=纯审批不联动) */
    private String bizType;
    /** 关联业务单据ID */
    private Long bizId;
    /** 流程标题 */
    private String title;
    /** 发起人ID */
    private Long initiatorId;
    /** 表单数据（JSON） */
    private String formData;
    /** 状态（0进行中 1已通过 2已拒绝 3已撤销 4待修改(被退回)） */
    private Integer status;
    /** 开始时间 */
    private LocalDateTime startTime;
    /** 结束时间 */
    private LocalDateTime endTime;
}
