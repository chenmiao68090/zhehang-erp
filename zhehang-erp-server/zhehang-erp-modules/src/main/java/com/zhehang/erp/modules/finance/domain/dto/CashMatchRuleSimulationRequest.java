package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 使用未保存的规则对一笔真实收款试算推荐结果。 */
@Data
public class CashMatchRuleSimulationRequest {
    private Long journalId;
    private String keyword;
    private CashMatchRuleRequest config;
}
