package com.zhehang.erp.modules.workflow.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 流程实例 VO
 */
@Data
public class WfInstanceVO {
    private Long id;
    private Long processDefId;
    private String processName;
    private String title;
    private Long initiatorId;
    private String initiatorName;
    private String formData;
    private Integer status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    /** 当前处理人(单人节点;会签取第一个) */
    private String currentAssigneeName;
    /** 当前节点全部待办处理人姓名(会签场景返回多人) */
    private List<String> currentAssigneeNames;
    /** 当前节点名称 */
    private String currentNodeName;
    /** 审批历史轨迹 */
    private List<WfHistoryVO> histories;
    /** 流程节点配置(JSON,含 nodes/edges),供前端画完整流程进度 */
    private String processConfig;
    /** 表单字段配置(JSON),供前端把 field_xxx 翻译为中文字段名 */
    private String formConfig;
    /** 抄送对象姓名列表 */
    private List<String> ccNames;
    /** 当前第一个待办任务ID(发起人催办用) */
    private Long currentTaskId;
    /** 当前待办任务的审批时限(超时判断/催办展示) */
    private LocalDateTime currentTaskDeadline;
    /** 附件列表(真文件,走 file 模块下载/预览) */
    private List<WfAttachmentVO> attachments;
}
