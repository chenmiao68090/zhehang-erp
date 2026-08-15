package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 收款工作台分页与保存视图查询条件。 */
@Data
public class CashJournalQuery {
    private Integer pageNum = 1;
    private Integer pageSize = 20;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate receiptDateStart;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate receiptDateEnd;
    private String status;
    private String recordStatus;
    private String matchStatus;
    private String reviewStatus;
    private String exceptionStatus;
    private String fundNature;
    private String paymentMethod;
    private String receiveAccount;
    private Long createBy;
    private Long ownerId;
    private String customerName;
    private String payerName;
    private String keyword;
    private BigDecimal amountMin;
    private BigDecimal amountMax;
    private Boolean onlyUnmatched;
    private Boolean over24h;
    private Boolean todayOnly;
    private Boolean includeVoid;
}
