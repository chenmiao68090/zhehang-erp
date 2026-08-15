package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_audit_instance")
public class FeigeAuditTask extends BaseEntity {
    private Long bridgeRunId;
    private String requestKey;
    private String requestFingerprint;
    private String taskNo;
    private Long orderId;
    private String orderNo;
    private String companyName;
    private String taskType;
    private String businessTypeCode;
    private String businessTypeName;
    private Long processId;
    private String processCode;
    private String processName;
    private Long stepId;
    private Integer stepOrder;
    private Integer totalSteps;
    private String stepName;
    private String taskStatus;
    private String auditResult;
    private Long assignedUserId;
    private String assignedUserName;
    private String requiredRoleKey;
    private Long businessOwnerId;
    private String businessOwnerName;
    private Long servicePersonId;
    private String servicePersonName;
    private Long deptId;
    private String scopeType;
    private String teamName;
    private String region;
    private BigDecimal amount;
    private BigDecimal expenseAmount;
    private String startMonth;
    private String endMonth;
    private String remarks;
    private String auditDataJson;
    private String auditRemark;
    private String rejectReason;
    private LocalDateTime auditTime;
    private Long auditUserId;
    private String auditUserName;
    private String processSnapshotJson;
    private Integer finalConfirm;
    @Version
    private Integer version;
}
