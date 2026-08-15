package com.zhehang.erp.modules.hrm.domain.vo;

import lombok.Data;

/** 离职人员中心的汇总卡片。 */
@Data
public class OffboardingSummaryVO {
    private Long total;
    private Long inProgress;
    private Long riskCount;
    private Long accountRiskCount;
    private Long closedCount;
}
