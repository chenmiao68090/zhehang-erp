package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.time.LocalDateTime;

/** 异常创建、认领、转交、进展、解决和重开共用入参。 */
@Data
public class CashExceptionActionRequest {
    private Long journalId;
    private Long dailyCloseId;
    private String exceptionType;
    private String priority;
    private Long ownerId;
    private String nextAction;
    private LocalDateTime nextFollowUpTime;
    private String note;
    private String resolution;
    private String metadataJson;
}
