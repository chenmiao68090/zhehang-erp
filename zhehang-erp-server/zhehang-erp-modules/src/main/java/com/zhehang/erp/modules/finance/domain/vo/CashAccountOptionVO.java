package com.zhehang.erp.modules.finance.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

/** 收款登记可见的安全账户主档，不包含期初、系统或实际余额。 */
@Data
@AllArgsConstructor
public class CashAccountOptionVO {
    private Long id;
    private String accountName;
    private String accountType;
    private String institutionName;
    private String maskedAccountNo;
    private String status;
}
