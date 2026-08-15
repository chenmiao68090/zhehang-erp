package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalesStageCustomerVO {
    private Long leadId;
    private String companyName;
    private Long ownerId;
    private String ownerName;
    private Long deptId;
    private String deptName;
    private String stageCode;
    private String stageName;
    private LocalDateTime stageEnteredAt;
    private Long stageAgeDays;
    private String nextActionType;
    private LocalDateTime nextActionTime;
    private LocalDateTime lastFollowTime;
    private BigDecimal expectedAmount;
    private Boolean overdue;
    private String customerLevel;
}
