package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/** 日结中的单个收款账户核对明细。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_daily_close_account")
public class FinCashDailyCloseAccount extends BaseEntity {
    private Long closeId;
    private String accountName;
    private Integer systemCount;
    private BigDecimal systemAmount;
    private Integer actualCount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private String differenceReason;
    private String status;
}
