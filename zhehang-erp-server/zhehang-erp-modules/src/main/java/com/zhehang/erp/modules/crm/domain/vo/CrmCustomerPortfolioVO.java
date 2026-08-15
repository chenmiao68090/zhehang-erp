package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 销售正式客户工作台单行数据。
 */
@Data
public class CrmCustomerPortfolioVO {
    private Long id;
    private String name;
    private String shortName;
    private String level;
    private Integer status;
    private Long ownerId;
    private String ownerName;
    private Long deptId;
    private String source;
    private String servicePackage;
    private String billingCycle;
    private LocalDateTime createTime;

    private Long leadId;
    private String contactName;
    private String contactPhone;

    private LocalDateTime lastFollowTime;
    private String lastFollowContent;
    private LocalDateTime nextFollowTime;
    private String nextFollowContent;
    private Boolean followDueToday;
    private Boolean followOverdue;

    private Integer contractCount;
    private Long latestContractId;
    private String latestContractNo;
    private Integer latestContractStatus;
    private LocalDate contractEndDate;

    private Long handoverId;
    private String handoverNo;
    private String handoverStatus;
    private LocalDate handoverDeadline;
    private Boolean handoverOverdue;

    private BigDecimal arrearsAmount;
    private LocalDate receivableDueDate;
    private Boolean badDebtRisk;
    private Boolean pausedService;
}
