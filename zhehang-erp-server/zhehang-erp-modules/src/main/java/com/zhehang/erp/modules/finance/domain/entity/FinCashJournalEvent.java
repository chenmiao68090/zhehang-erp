package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 收款登记、核销、审核、反审核和作废等高风险业务事件。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_journal_event")
public class FinCashJournalEvent extends BaseEntity {
    private Long journalId;
    private String eventType;
    private String fromStatus;
    private String toStatus;
    private String content;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime eventTime;
    private String metadataJson;
}
