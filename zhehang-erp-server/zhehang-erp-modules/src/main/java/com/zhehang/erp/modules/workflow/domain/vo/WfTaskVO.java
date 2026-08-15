package com.zhehang.erp.modules.workflow.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审批任务 VO
 */
@Data
public class WfTaskVO {
    private Long id;
    private Long instanceId;
    private String nodeName;
    private String nodeType;
    private Long assigneeId;
    private String assigneeName;
    private Integer status;
    private String comment;
    private LocalDateTime handleTime;
    private LocalDateTime createTime;
    /** 流程相关信息 */
    private String processName;
    private String instanceTitle;
    private Long initiatorId;
    private String initiatorName;
    private LocalDateTime startTime;
    /** 流程节点ID */
    private String nodeId;
    /** 审批时限(空=不限时) */
    private LocalDateTime deadline;
    /** 卡片摘要:表单金额(付款/借款等,来自 form_data.amount) */
    private String amount;
    /** 卡片摘要:请假/加班天数(来自 form_data.days) */
    private String days;
    /** 抄送已读:0未读 1已读(抄送我列表用) */
    private Integer readFlag;
}
