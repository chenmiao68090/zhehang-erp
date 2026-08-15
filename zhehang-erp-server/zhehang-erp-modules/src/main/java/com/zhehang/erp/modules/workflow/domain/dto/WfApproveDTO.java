package com.zhehang.erp.modules.workflow.domain.dto;

import lombok.Data;

/**
 * 审批操作 DTO
 */
@Data
public class WfApproveDTO {
    /** 任务ID */
    private Long taskId;
    /** 批量审批的任务ID列表 */
    private java.util.List<Long> taskIds;
    /** 审批意见 */
    private String comment;
    /** 转交目标用户ID（转交时使用） */
    private Long targetUserId;
}
