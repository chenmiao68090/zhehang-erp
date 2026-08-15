package com.zhehang.erp.modules.feigetask.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 飞哥任务工作台写入契约。所有外部用户/角色 ID 都必须在服务层再次按当前租户和数据范围校验。
 */
public final class FeigeTaskRequests {

    private FeigeTaskRequests() {
    }

    @Data
    public static class BusinessCreate {
        @Size(max = 64)
        private String requestKey;
        private Long orderId;
        @Size(max = 64)
        private String orderNo;
        @Size(max = 200)
        private String companyName;
        private Long businessOwnerId;
        @Size(max = 1000)
        private String remarks;
    }

    @Data
    public static class ManagerReview {
        private String result;
        private String assignType;
        private Long assignedUserId;
        private String targetStatus;
        private Long assigneeId;
        @Size(max = 1000)
        private String remark;
    }

    @Data
    public static class CostUpdate {
        @Size(max = 100)
        private String category;
        private BigDecimal amount;
        @Size(max = 100)
        private String costCategory;
        @DecimalMin("0.00")
        private BigDecimal costAmount;
        @Size(max = 1000)
        private String remark;
    }

    @Data
    public static class ExceptionMove {
        private String targetStatus;
        private String exceptionType;
        @NotBlank
        @Size(max = 1000)
        private String reason;
    }

    @Data
    public static class UserAssignment {
        private Long userId;
        private Long assigneeId;
        private Long handoverToId;
        @Size(max = 1000)
        private String remark;
    }

    @Data
    public static class AuditProcessUpsert {
        @NotBlank
        @Size(max = 64)
        private String processCode;
        @NotBlank
        @Size(max = 150)
        private String processName;
        @NotBlank
        private String taskType;
        @Size(max = 64)
        private String businessTypeCode;
        @Size(max = 1000)
        private String description;
        private Integer enabled;
        @Valid
        @NotEmpty
        @Size(max = 30)
        private List<AuditStep> steps;
    }

    @Data
    public static class AuditStep {
        @NotNull
        @Min(1)
        @Max(30)
        private Integer stepOrder;
        @NotBlank
        @Size(max = 150)
        private String stepName;
        @Size(max = 64)
        private String requiredRoleKey;
        @NotBlank
        private String assigneeMode;
        private Long requiredUserId;
        private Integer allowBatch;
        private Integer finalStep;
        private String formSchemaJson;
        private String indicatorSchemaJson;
    }

    @Data
    public static class AuditTaskCreate {
        @Size(max = 64)
        private String requestKey;
        @NotNull
        private Long processId;
        private Long orderId;
        @Size(max = 64)
        private String orderNo;
        @Size(max = 200)
        private String companyName;
        @Size(max = 64)
        private String businessTypeCode;
        @Size(max = 150)
        private String businessTypeName;
        private Long businessOwnerId;
        @Size(max = 32)
        private String scopeType;
        @Size(max = 150)
        private String teamName;
        @Size(max = 150)
        private String region;
        @DecimalMin("0.00")
        private BigDecimal amount;
        @DecimalMin("0.00")
        private BigDecimal expenseAmount;
        @Size(max = 16)
        private String startMonth;
        @Size(max = 16)
        private String endMonth;
        private Long servicePersonId;
        @Size(max = 1000)
        private String remarks;
        private Integer finalConfirm;
    }

    @Data
    public static class AuditReview {
        @NotBlank
        private String result;
        private String auditDataJson;
        private Map<String, Object> formData;
        private List<Map<String, Object>> costItems;
        private Long nextAuditorId;
        private Boolean convertContract;
        private Boolean convertAddress;
        @Size(max = 1000)
        private String remark;
        @Size(max = 1000)
        private String rejectReason;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class BatchAuditReview extends AuditReview {
        @NotEmpty
        @Size(max = 100)
        private List<@NotNull Long> taskIds;
    }

    @Data
    public static class WorkflowTemplateUpsert {
        @NotNull
        private Long roleId;
        @NotBlank
        private String cycleType;
        @NotBlank
        @Size(max = 200)
        private String taskName;
        @Size(max = 1000)
        private String completionStandard;
        private String workContent;
        private String detailFieldsJson;
        private Integer sortNo;
        private Boolean enabled;
        private String roleName;
        @Valid
        private List<WorkflowMetric> metrics;
    }

    @Data
    public static class WorkflowMetric {
        @NotBlank
        @Size(max = 64)
        private String code;
        @NotBlank
        @Size(max = 100)
        private String label;
        @NotBlank
        @Size(max = 16)
        private String fieldType;
        @Size(max = 32)
        private String unit;
        @NotNull
        private Boolean required;
        private Object value;
        private Object target;
    }

    @Data
    public static class WorkflowExtraTask {
        @NotBlank
        private String cycleType;
        @NotBlank
        @Size(max = 32)
        private String periodKey;
        @NotBlank
        @Size(max = 200)
        private String taskName;
        @Size(max = 1000)
        private String completionStandard;
        private String workContent;
        private String detailFieldsJson;
    }

    @Data
    public static class WorkflowTaskDetail {
        private String workDetailJson;
        @Valid
        private List<WorkflowMetric> metrics;
        @Size(max = 1000)
        private String remark;
    }

    @Data
    public static class WorkflowUndone {
        @NotBlank
        @Size(max = 1000)
        private String reason;
    }

    @Data
    public static class WorkflowSummary {
        @NotBlank
        private String cycleType;
        @NotBlank
        @Size(max = 32)
        private String periodKey;
        @Size(max = 10000)
        private String summary;
    }

    @Data
    public static class WorkflowRequiredUpsert {
        private String targetType;
        private String scopeType;
        @NotNull
        private Long targetId;
        @Size(max = 150)
        private String targetName;
        @Size(max = 1000)
        private String remark;
        private Integer active;
        private Boolean enabled;
    }

    @Data
    public static class GoalUpsert {
        @Size(max = 200)
        private String goalName;
        private String goalType;
        @NotBlank
        @Size(max = 200)
        private String title;
        @NotBlank
        private String cycleType;
        private Long roleId;
        private String roleName;
        private Long userId;
        private String userName;
        @NotNull
        @Min(2000)
        @Max(2200)
        private Integer year;
        @Size(max = 32)
        private String periodKey;
        @Size(max = 100)
        private String metricName;
        @NotNull
        @DecimalMin("0.00")
        private BigDecimal targetValue;
        @DecimalMin("0.00")
        private BigDecimal actualValue;
        @Size(max = 2000)
        private String description;
        private String status;
        @Valid
        private List<GoalPlanPayload> plans;
        @Min(2000)
        @Max(2200)
        private Integer periodYear;
        @Min(1)
        @Max(12)
        private Integer periodIndex;
        @DecimalMin("0.00")
        private BigDecimal performanceTarget;
        @DecimalMin("0.00")
        private BigDecimal performanceActual;
        @DecimalMin("0.00")
        private BigDecimal bookkeepingTarget;
        @DecimalMin("0.00")
        private BigDecimal bookkeepingActual;
        @DecimalMin("0.00")
        private BigDecimal renewalTarget;
        @DecimalMin("0.00")
        private BigDecimal renewalActual;
        @Size(max = 32)
        private String unit;
        @Size(max = 2000)
        private String goalDesc;
        private Integer sortNo;
    }

    @Data
    public static class GoalStatus {
        @NotBlank
        private String status;
        @Size(max = 1000)
        private String completionNote;
    }

    @Data
    public static class GoalPlanUpsert {
        @NotBlank
        @Size(max = 150)
        private String planName;
        @Size(max = 2000)
        private String planDesc;
        @DecimalMin("0.00")
        private BigDecimal performanceTarget;
        @DecimalMin("0.00")
        private BigDecimal performanceActual;
        @DecimalMin("0.00")
        private BigDecimal bookkeepingTarget;
        @DecimalMin("0.00")
        private BigDecimal bookkeepingActual;
        @DecimalMin("0.00")
        private BigDecimal renewalTarget;
        @DecimalMin("0.00")
        private BigDecimal renewalActual;
        private Integer sortNo;
        private String status;
    }

    @Data
    public static class GoalPlanPayload {
        private Long id;
        @NotBlank
        @Size(max = 150)
        private String title;
        @Size(max = 2000)
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        @Valid
        private List<GoalPlanUserPayload> users;
    }

    @Data
    public static class GoalPlanUserPayload {
        private Long id;
        @NotNull
        private Long userId;
        private String userName;
        @DecimalMin("0.00")
        private BigDecimal targetValue;
        @DecimalMin("0.00")
        private BigDecimal actualValue;
    }

    @Data
    public static class AuditAction {
        private String action;
        private String result;
        private String remark;
        private String rejectReason;
        private Map<String, Object> formData;
        private List<Map<String, Object>> costItems;
        private Long nextAuditorId;
        private Long servicePersonId;
        private Boolean convertContract;
        private Boolean convertAddress;
    }

    @Data
    public static class BridgeRuleUpsert {
        @NotBlank
        @Size(max = 64)
        private String ruleCode;
        @NotBlank
        @Size(max = 150)
        private String ruleName;
        @NotBlank
        private String triggerEvent;
        @NotBlank
        private String targetTaskType;
        private Long processId;
        @Size(max = 64)
        private String businessTypeCode;
        @Size(max = 32)
        private String scopeType;
        private Integer finalConfirm;
        private Integer enabled;
    }
}
