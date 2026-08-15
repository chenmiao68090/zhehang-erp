package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 银行或支付平台实际余额与系统余额的不可变核对快照。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_balance_snapshot")
public class FinCashBalanceSnapshot extends BaseEntity {
    private String requestNo;
    private Long accountId;
    private String accountNameSnapshot;
    private LocalDate snapshotDate;
    private BigDecimal systemBalance;
    private BigDecimal actualBalance;
    private BigDecimal differenceAmount;
    /** manual/import/api */
    private String sourceType;
    /** matched/difference/resolved */
    private String status;
    private String differenceReason;
    private String evidenceFile;
    private Long submittedBy;
    private String submittedByName;
    private LocalDateTime submittedAt;
    private Long resolvedBy;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private String resolution;
    @Version
    private Integer version;
}
