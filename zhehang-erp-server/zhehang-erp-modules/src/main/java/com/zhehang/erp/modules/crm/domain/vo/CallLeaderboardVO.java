package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 销售通话排行榜。只返回坐席和汇总指标，不包含客户、号码、录音或通话小结。
 */
@Data
public class CallLeaderboardVO {
    private String period;
    private String metric;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer targetPerDay;
    private Integer periodDays;
    private Long targetCount;
    private Double gapToPrevious;
    private String gapUnit;
    private Row self;
    private List<Row> rows = new ArrayList<>();

    @Data
    public static class Row {
        private Integer rank;
        private Long userId;
        private String agentName;
        private String deptName;
        private Long callCount;
        private Long connectedCount;
        private Double connectRate;
        private Long validCount;
        private Double validRate;
        private Long totalDuration;
        private String totalDurationText;
        private Long targetCount;
        private Double targetProgress;
        private Boolean currentUser;
    }
}
