package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_audit_process")
public class FeigeAuditProcess extends BaseEntity {
    private String processCode;
    private String processName;
    private String taskType;
    private String businessTypeCode;
    private String description;
    private Integer enabled;
    @Version
    private Integer version;
}
