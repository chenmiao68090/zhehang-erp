package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 人工确认或解决付款方别名冲突。 */
@Data
public class CashPayerAliasRequest {
    private String payerName;
    private Long customerId;
    private Long sourceJournalId;
    private String reason;
}
