package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;

/** 可解释核销推荐权重与阈值。 */
@Data
public class CashMatchRuleRequest {
    private String configName;
    private Integer customerExactWeight;
    private Integer customerConflictPenalty;
    private Integer orderNoWeight;
    private Integer payerAliasWeight;
    private Integer payerSimilarWeight;
    private Integer amountExactWeight;
    private Integer amountNearWeight;
    private Integer salesWeight;
    private Integer dateWeight;
    private BigDecimal amountToleranceRate;
    private BigDecimal amountToleranceFloor;
    private Integer dateWindowDays;
    private Integer highThreshold;
    private Integer mediumThreshold;
    private Integer maxCandidates;
    private Integer version;
    private String reason;
}
