package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 解决余额差异，不覆盖原系统/实际余额快照。 */
@Data
public class CashBalanceResolveRequest {
    private String resolution;
    private Integer version;
}
