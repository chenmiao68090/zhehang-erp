package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_pool_rule_version")
public class CrmPoolRuleVersion extends BaseEntity {
    private Integer versionNo;
    /** DRAFT / SCHEDULED / ACTIVE / ARCHIVED */
    private String status;
    private LocalDateTime effectiveTime;
    private Integer dailyClaimLimit;
    private Integer singleClaimLimit;
    private Integer dailyManualEntryLimit;
    private Integer singleImportLimit;
    private Integer dailyImportLimit;
    private Integer privateHoldingLimit;
    private Integer privateWarningPercent;
    private Integer protectionDays;
    private Integer recycleNoFollowDays;
    private Integer recycleWarningDays;
    private Integer releaseCooldownDays;
    private Integer duplicateBlockEnabled;
    private String changeSummary;
    private Long publishedBy;
    private LocalDateTime publishedTime;
}
