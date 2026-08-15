package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 回款续费催收/收款历史。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_receivable_collection_log")
public class FinReceivableCollectionLog extends BaseEntity {
    private Long receivableId;
    private Long cashJournalId;
    private Long cashMatchId;
    /** legacy/cash_journal/reversal */
    private String sourceType;
    private String actionType;
    private LocalDateTime actionTime;
    private Long operatorId;
    private String operatorName;
    private String beforeStatus;
    private String afterStatus;
    private BigDecimal paymentAmount;
    private BigDecimal receivedAfter;
    private BigDecimal arrearsAfter;
    private LocalDateTime nextCollectionTime;
    private String content;
}
