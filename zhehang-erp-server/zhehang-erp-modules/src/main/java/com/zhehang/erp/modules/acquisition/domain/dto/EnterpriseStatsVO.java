package com.zhehang.erp.modules.acquisition.domain.dto;

import lombok.Data;

@Data
public class EnterpriseStatsVO {
    /** 总数 */
    private Long totalCount;
    /** 税务非正常户数 */
    private Long taxAbnormalCount;
    /** 欠税公告数 */
    private Long taxArrearsCount;
    /** 重大违法数 */
    private Long majorViolationCount;
    /** 行政处罚数 */
    private Long taxPenaltyCount;
    /** 经营异常数 */
    private Long operationAbnormalCount;
}
