package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 资金账户与最新余额核对摘要。 */
@Data
public class CashAccountSummaryVO {
    private Long id;
    private String accountCode;
    private String accountName;
    private String accountType;
    private String institutionName;
    private String maskedAccountNo;
    private String currency;
    private LocalDate openingDate;
    private BigDecimal openingBalance;
    private String status;
    private Integer sortOrder;
    private String remark;
    private Integer version;
    private BigDecimal receiptInflow;
    private BigDecimal adjustmentNet;
    private BigDecimal systemBalance;
    private Long latestSnapshotId;
    private LocalDate latestSnapshotDate;
    private BigDecimal latestActualBalance;
    private BigDecimal latestDifference;
    private String latestSnapshotStatus;
    private Long unresolvedDifferenceCount;
    private LocalDateTime updateTime;
}
