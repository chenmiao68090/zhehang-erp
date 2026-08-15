package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 每租户一份生效中的可解释核销推荐规则。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_match_rule_config")
public class FinCashMatchRuleConfig extends BaseEntity {
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
    @Version
    private Integer version;
    private String updateReason;
    private Long activatedBy;
    private LocalDateTime activatedAt;
}
