package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 银行、微信或支付宝到账文件的对账批次。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_reconcile_batch")
public class FinCashReconcileBatch extends BaseEntity {
    private String batchNo;
    private String requestNo;
    private String accountName;
    private LocalDate statementStart;
    private LocalDate statementEnd;
    private String fileName;
    private String mappingJson;
    private Integer totalCount;
    private Integer matchedCount;
    private Integer suggestedCount;
    private Integer unmatchedCount;
    private Integer conflictCount;
    private Integer ignoredCount;
    private BigDecimal statementAmount;
    private BigDecimal matchedAmount;
    /** matched/needs_review/resolved */
    private String status;
    private Long importedBy;
    private String importedByName;
    private LocalDateTime importedAt;
}
