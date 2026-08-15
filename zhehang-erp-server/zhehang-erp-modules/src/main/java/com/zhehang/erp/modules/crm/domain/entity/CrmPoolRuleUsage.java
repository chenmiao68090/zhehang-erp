package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_pool_rule_usage")
public class CrmPoolRuleUsage extends BaseEntity {
    private LocalDate usageDate;
    private Long userId;
    /** MANUAL_ENTRY / BATCH_IMPORT */
    private String metricCode;
    private Integer usedCount;
}
