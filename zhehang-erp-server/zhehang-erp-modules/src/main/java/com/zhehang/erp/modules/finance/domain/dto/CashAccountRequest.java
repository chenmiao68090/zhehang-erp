package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 新建或维护资金账户。期初信息创建后只允许通过余额调整修正。 */
@Data
public class CashAccountRequest {
    private String accountName;
    private String accountType;
    private String institutionName;
    private String maskedAccountNo;
    private String currency;
    private LocalDate openingDate;
    private BigDecimal openingBalance;
    private Integer sortOrder;
    private String remark;
    private Integer version;
}
