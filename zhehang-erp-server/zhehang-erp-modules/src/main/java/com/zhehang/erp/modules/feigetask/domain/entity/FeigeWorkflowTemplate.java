package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_workflow_template")
public class FeigeWorkflowTemplate extends BaseEntity {
    private Long roleId;
    private String roleName;
    private String cycleType;
    private String taskName;
    private String completionStandard;
    private String workContent;
    private String detailFieldsJson;
    private Integer sortNo;
    private Integer enabled;
    @Version
    private Integer version;
}
