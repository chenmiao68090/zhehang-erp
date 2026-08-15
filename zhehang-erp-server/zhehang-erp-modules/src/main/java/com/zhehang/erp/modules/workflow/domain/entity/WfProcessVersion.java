package com.zhehang.erp.modules.workflow.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 流程定义发布版本快照:每次发布定格一份表单/流程配置,
 * 在途实例永远读自己绑定的快照,改定义/改节点名不影响在途单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wf_process_version")
public class WfProcessVersion extends BaseEntity {
    /** 流程定义ID */
    private Long processDefId;
    /** 定义版本号(对应发布时 wf_process_def.version) */
    private Integer version;
    /** 发布时的流程名称 */
    private String name;
    /** 表单配置快照 */
    private String formConfig;
    /** 流程配置快照 */
    private String processConfig;
    /** 发布人用户ID */
    private Long publishBy;
    /** 发布时间 */
    private LocalDateTime publishTime;
}
