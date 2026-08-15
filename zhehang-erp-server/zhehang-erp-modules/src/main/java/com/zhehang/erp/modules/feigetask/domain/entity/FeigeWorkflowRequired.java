package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_workflow_required")
public class FeigeWorkflowRequired extends BaseEntity {
    private String targetType;
    private Long targetId;
    private String targetName;
    private String remark;
    private Integer active;
    @Version
    private Integer version;
}
