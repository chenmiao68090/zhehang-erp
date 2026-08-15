package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 对账文件的一行入账及其自动/人工比对结果。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_reconcile_item")
public class FinCashReconcileItem extends BaseEntity {
    private Long batchId;
    private Integer rowNo;
    private LocalDate transactionDate;
    private LocalDateTime transactionTime;
    private BigDecimal amount;
    private String payerNameRaw;
    private String payerNameNormalized;
    private String bankSerialNo;
    private String summary;
    /** matched/suggested/unmatched/conflict/ignored */
    private String matchStatus;
    private Long journalId;
    private String receiptNoSnapshot;
    private String matchRule;
    private Integer confidenceScore;
    /** auto/manual_link/ignored */
    private String resolution;
    private String resolutionReason;
    private Long resolvedBy;
    private LocalDateTime resolvedAt;
}
