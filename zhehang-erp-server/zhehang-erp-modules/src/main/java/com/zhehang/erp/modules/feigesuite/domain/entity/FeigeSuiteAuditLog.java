package com.zhehang.erp.modules.feigesuite.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_suite_audit_log")
public class FeigeSuiteAuditLog extends BaseEntity {
    private String pageCode;
    private Long recordId;
    private String action;
    private String fromStatus;
    private String toStatus;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private String snapshotJson;
}
