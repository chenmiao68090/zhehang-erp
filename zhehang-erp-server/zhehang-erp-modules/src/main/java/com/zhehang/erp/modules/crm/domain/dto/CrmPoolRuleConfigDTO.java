package com.zhehang.erp.modules.crm.domain.dto;

import lombok.Data;

@Data
public class CrmPoolRuleConfigDTO {
    private Long id;
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
    private Boolean duplicateBlockEnabled;
    private String changeSummary;
}
