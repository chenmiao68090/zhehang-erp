package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 销售客户360只读聚合视图。所有列表均已在服务层按当前用户数据范围过滤。
 */
@Data
public class CrmCustomer360VO {

    private Overview overview = new Overview();
    private Stats stats = new Stats();
    private List<ContactItem> contacts = new ArrayList<>();
    private List<OpportunityItem> opportunities = new ArrayList<>();
    private List<TransactionItem> transactions = new ArrayList<>();
    private List<ServiceItem> services = new ArrayList<>();
    private List<TimelineItem> timeline = new ArrayList<>();

    @Data
    public static class Overview {
        private Long leadId;
        private Long customerId;
        private String leadNo;
        private String companyName;
        private String contactName;
        private String phone;
        private String wechat;
        private String email;
        private Long ownerId;
        private String ownerName;
        private Long deptId;
        private String ownership;
        private Integer lifecycleStatus;
        private Integer customerStatus;
        private String followStatus;
        private String customerLevel;
        private String intentLevel;
        private String source;
        private String serviceType;
        private String quoteStatus;
        private BigDecimal quotedPrice;
        private BigDecimal dealAmount;
        private LocalDateTime lastFollowTime;
        private String lastFollowContent;
        private String nextActionType;
        private LocalDateTime nextActionTime;
        private String nextActionContent;
        private LocalDate serviceExpireDate;
        private boolean converted;
        private boolean customerDataRestricted;
        // ===== 资料tab工商信息(客户360资料补齐,取自线索工商字段) =====
        private String legalPerson;
        private String companyPhone;
        private String registerStatus;
        private String enterpriseType;
        private String enterpriseScale;
        private BigDecimal registeredCapital;
        private String paidCapital;
        private String creditCode;
        private LocalDate establishedDate;
        private String region;
        private String registerAddress;
        private String latestAddress;
        private String businessScope;
        private String insuredCount;
        private String insuredYear;
        private String industry;
    }

    @Data
    public static class Stats {
        private long followCount;
        private long callCount;
        private long opportunityCount;
        private long orderCount;
        private long openIssueCount;
        private BigDecimal opportunityAmount = BigDecimal.ZERO;
        private BigDecimal orderAmount = BigDecimal.ZERO;
        private BigDecimal receivedAmount = BigDecimal.ZERO;
        private BigDecimal arrearsAmount = BigDecimal.ZERO;
    }

    @Data
    public static class ContactItem {
        private Long id;
        private String name;
        private String position;
        private String mobile;
        private String phone;
        private String wechat;
        private String email;
        private boolean primary;
    }

    @Data
    public static class OpportunityItem {
        private Long id;
        private String name;
        private BigDecimal amount;
        private Integer stage;
        private String stageName;
        private Integer winRate;
        private LocalDate expectedDate;
        private Long ownerId;
        private String ownerName;
        private String remark;
    }

    @Data
    public static class TransactionItem {
        /** order/contract/receipt/receivable */
        private String type;
        private Long id;
        private String number;
        private String title;
        private String status;
        private BigDecimal amount;
        private BigDecimal receivedAmount;
        private BigDecimal arrearsAmount;
        private LocalDateTime eventTime;
    }

    @Data
    public static class ServiceItem {
        private Long id;
        private String number;
        private String type;
        private String title;
        private String priority;
        private String status;
        private String ownerName;
        private LocalDateTime deadline;
        private boolean overdue;
    }

    @Data
    public static class TimelineItem {
        /** lead/follow/call/opportunity/order/contract/receipt/receivable/issue/conversion */
        private String type;
        private Long id;
        private String title;
        private String content;
        private String status;
        private String actorName;
        private LocalDateTime occurredAt;
        private BigDecimal amount;
        private boolean recordingAvailable;
        /** 通话时长(秒),仅 type=call 有值;前端展示为时长徽章 */
        private Integer durationSeconds;
    }
}
