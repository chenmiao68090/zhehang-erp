package com.zhehang.erp.modules.dashboard.domain.vo;

import lombok.Data;

@Data
public class DashboardStatsVO {
    private Integer todoCount;
    private Integer approvalCount;
    private Integer customerFollowCount;
    private Double monthlyPerformance;
}
