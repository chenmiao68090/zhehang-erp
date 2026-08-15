package com.zhehang.erp.modules.workflow.domain.dto;

import lombok.Data;

import java.util.Map;

/**
 * 发起流程 DTO
 */
@Data
public class WfStartDTO {
    /** 流程标识 */
    private String processKey;
    /** 流程标题 */
    private String title;
    /** 表单数据 */
    private Map<String, Object> formData;
    /** 关联业务类型(如 hrm_leave/fin_reimburse/org_transfer;空=纯审批不联动) */
    private String bizType;
    /** 关联业务单据ID(有 bizType 时可选:onStarted 回调可自建单据并回填) */
    private Long bizId;
}
