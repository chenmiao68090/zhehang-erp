package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_workflow_item")
public class FeigeWorkflowTask extends BaseEntity {
    private Long templateId;
    private Long userId;
    private String userName;
    private Long roleId;
    private String roleName;
    private Long deptId;
    private String cycleType;
    private String periodKey;
    private String taskName;
    private String completionStandard;
    private String workContent;
    private String source;
    private String detailFieldsJson;
    private String workDetailJson;
    private Integer done;
    private LocalDateTime doneTime;
    private String undoneReason;
    private String remark;
    @Version
    private Integer version;
}
