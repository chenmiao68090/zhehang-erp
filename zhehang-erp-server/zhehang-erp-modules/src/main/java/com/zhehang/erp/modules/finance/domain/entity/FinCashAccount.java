package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 资金账户主档。余额由期初、有效收款和账户调整实时聚合。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_account")
public class FinCashAccount extends BaseEntity {
    private String accountCode;
    private String accountName;
    /** bank/wechat/alipay/cash/other */
    private String accountType;
    private String institutionName;
    /** 只允许保存脱敏账号。 */
    private String maskedAccountNo;
    private String currency;
    private LocalDate openingDate;
    private BigDecimal openingBalance;
    /** active/disabled */
    private String status;
    private Integer sortOrder;
    private String remark;
    @Version
    private Integer version;
}
