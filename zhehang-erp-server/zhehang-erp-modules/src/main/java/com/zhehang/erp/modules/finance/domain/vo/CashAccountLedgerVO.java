package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 资金账户统一流水：真实到账与余额调整同表展示。 */
@Data
public class CashAccountLedgerVO {
    private Long sourceId;
    private String sourceType;
    private LocalDate businessDate;
    private LocalDateTime businessTime;
    private BigDecimal inflowAmount;
    private BigDecimal outflowAmount;
    private String referenceNo;
    private String counterparty;
    private String summary;
    private String status;
    private Long operatorId;
    private String operatorName;
    private Long reversalOfId;
}
