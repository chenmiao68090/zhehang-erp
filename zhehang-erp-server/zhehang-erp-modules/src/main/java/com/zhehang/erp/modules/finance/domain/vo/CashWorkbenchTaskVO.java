package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 今日必须处理聚合任务；不是第二套业务表，只指向真实来源记录。 */
@Data
public class CashWorkbenchTaskVO {
    private String taskKey;
    private String sourceType;
    private Long sourceId;
    private Long journalId;
    private String priority;
    private String taskType;
    private String title;
    private String reason;
    private BigDecimal amount;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime deadline;
    private String action;
}
