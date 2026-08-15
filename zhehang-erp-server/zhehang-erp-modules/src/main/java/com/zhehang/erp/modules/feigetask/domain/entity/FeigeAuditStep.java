package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_audit_step")
public class FeigeAuditStep extends BaseEntity {
    private Long processId;
    private Integer stepOrder;
    private String stepName;
    private String requiredRoleKey;
    private String assigneeMode;
    private Long requiredUserId;
    private Integer allowBatch;
    private Integer finalStep;
    private String formSchemaJson;
    private String indicatorSchemaJson;
    @Version
    private Integer version;
}
