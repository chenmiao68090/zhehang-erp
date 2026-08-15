package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 将历史 legacy 回款迁移关联到一笔真实收款。 */
@Data
public class CashLegacyLinkRequest {
    private Long journalId;
}
