package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SalesConsoleVO {
    private String viewMode;
    private Scope scope = new Scope();
    private Range range = new Range();
    private LocalDateTime dataSince;
    private boolean historyAvailable;
    private Metrics metrics = new Metrics();
    private TaskSummary taskSummary = new TaskSummary();
    private List<StageItem> newBusinessFunnel = new ArrayList<>();
    private RenewalSummary renewalSummary = new RenewalSummary();
    private List<ActionItem> actions = new ArrayList<>();
    private List<ExceptionItem> exceptions = new ArrayList<>();
    private List<BossAction> bossActions = new ArrayList<>();
    private List<TeamMember> team = new ArrayList<>();
    private FilterOptions filters = new FilterOptions();

    @Data
    public static class Scope {
        private String mode;
        private String label;
        private Long ownerId;
        private Long deptId;
    }

    @Data
    public static class Range {
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    public static class Metrics {
        private BigDecimal confirmedAmount = BigDecimal.ZERO;
        private long confirmedOrderCount;
        private BigDecimal newBusinessAmount = BigDecimal.ZERO;
        private long newBusinessCount;
        private BigDecimal renewalAmount = BigDecimal.ZERO;
        private long renewalCount;
        private BigDecimal weightedForecastAmount = BigDecimal.ZERO;
        private BigDecimal forecastDataCompleteness = BigDecimal.ZERO;
        private boolean targetConfigured;
        private BigDecimal targetAmount;
        private BigDecimal targetGap;
    }

    @Data
    public static class TaskSummary {
        private long activeLeadCount;
        private long todayActionCount;
        private long overdueCount;
        private long noNextActionCount;
        private long highIntentCount;
    }

    @Data
    public static class StageItem {
        private String code;
        private String label;
        private int order;
        private long currentCount;
        private long enteredCount;
        private long advancedCount;
        private BigDecimal conversionRate;
        private long overdueCount;
    }

    @Data
    public static class RenewalSummary {
        private long outstandingCount;
        private BigDecimal outstandingAmount = BigDecimal.ZERO;
        private long dueSoonCount;
        private BigDecimal dueSoonAmount = BigDecimal.ZERO;
        private long overdueCount;
        private BigDecimal overdueAmount = BigDecimal.ZERO;
        private long promisedCount;
        private BigDecimal promisedAmount = BigDecimal.ZERO;
        private long badRiskCount;
        private BigDecimal badRiskAmount = BigDecimal.ZERO;
    }

    @Data
    public static class ActionItem {
        private Long leadId;
        private String companyName;
        private Long ownerId;
        private String ownerName;
        private Long deptId;
        private String deptName;
        private String stageCode;
        private String stageName;
        private String nextActionType;
        private LocalDateTime nextActionTime;
        private LocalDateTime lastFollowTime;
        private BigDecimal expectedAmount;
        private String actionType;
        private String severity;
        private long ageDays;
        private String customerLevel;
    }

    @Data
    public static class ExceptionItem {
        private String type;
        private String label;
        private String severity;
        private long count;
        private BigDecimal amount;
    }

    @Data
    public static class BossAction {
        private String type;
        private String title;
        private String reason;
        private String severity;
        private long count;
        private BigDecimal amount;
    }

    @Data
    public static class TeamMember {
        private Long ownerId;
        private String ownerName;
        private Long deptId;
        private String deptName;
        private long activeLeadCount;
        private long overdueCount;
        private long noNextActionCount;
        private BigDecimal confirmedAmount = BigDecimal.ZERO;
        private long confirmedOrderCount;
    }

    @Data
    public static class FilterOptions {
        private List<OwnerOption> owners = new ArrayList<>();
        private List<DepartmentOption> departments = new ArrayList<>();
    }

    @Data
    public static class OwnerOption {
        private Long id;
        private String name;
        private Long deptId;
        private String deptName;
    }

    @Data
    public static class DepartmentOption {
        private Long id;
        private String name;
    }
}
