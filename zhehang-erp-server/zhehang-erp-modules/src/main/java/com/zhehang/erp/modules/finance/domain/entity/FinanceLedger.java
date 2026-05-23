package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_ledger")
public class FinanceLedger extends BaseEntity {
    private String subjectCode;
    private String subjectName;
    private String period;
    private BigDecimal openingBalance;
    private BigDecimal debitTotal;
    private BigDecimal creditTotal;
    private BigDecimal closingBalance;
    /** DEBIT or CREDIT */
    private String direction;
}
