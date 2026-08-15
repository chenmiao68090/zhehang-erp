package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 提交账户实际余额核对快照。 */
@Data
public class CashBalanceSnapshotRequest {
    private String requestNo;
    private LocalDate snapshotDate;
    private BigDecimal actualBalance;
    private String sourceType;
    private String differenceReason;
    private String evidenceFile;
}
