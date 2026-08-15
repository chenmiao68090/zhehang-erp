package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 账户余额增加/减少或冲正请求。 */
@Data
public class CashAccountAdjustmentRequest {
    private String requestNo;
    private LocalDate adjustmentDate;
    private String direction;
    private String adjustmentType;
    private BigDecimal amount;
    private String reason;
    private String evidenceFile;
}
