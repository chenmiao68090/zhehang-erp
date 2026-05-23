package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_receivable")
public class FinanceReceivable extends BaseEntity {
    /** RECEIVABLE or PAYABLE */
    private String type;
    private Long customerId;
    private Long contractId;
    private BigDecimal amount;
    private BigDecimal receivedAmount;
    private BigDecimal remainingAmount;
    private LocalDate dueDate;
    /** 0pending 1partial 2completed */
    private Integer status;
}
