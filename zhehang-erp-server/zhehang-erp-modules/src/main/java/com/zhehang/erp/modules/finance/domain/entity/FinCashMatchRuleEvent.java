package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 推荐规则变更历史。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_match_rule_event")
public class FinCashMatchRuleEvent extends BaseEntity {
    private Long configId;
    private String actionType;
    private String beforeJson;
    private String afterJson;
    private String reason;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime actionTime;
}
