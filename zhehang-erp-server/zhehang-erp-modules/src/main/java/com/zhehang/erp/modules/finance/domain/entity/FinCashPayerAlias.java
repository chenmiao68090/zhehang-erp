package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 付款方到 CRM 客户的人工确认映射。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_payer_alias")
public class FinCashPayerAlias extends BaseEntity {
    private String payerNameRaw;
    private String payerNameNormalized;
    private Long customerId;
    private String customerNameSnapshot;
    /** active/conflict/disabled */
    private String status;
    private Integer confidence;
    private Long confirmedBy;
    private LocalDateTime confirmedAt;
    private Long sourceJournalId;
    private LocalDateTime lastUsedAt;
    private Integer useCount;
}
