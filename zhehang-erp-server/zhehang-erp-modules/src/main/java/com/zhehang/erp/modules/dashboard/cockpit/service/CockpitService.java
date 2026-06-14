package com.zhehang.erp.modules.dashboard.cockpit.service;

import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import java.util.List;

/**
 * 经营驾驶舱服务。
 *
 * <p>除 AI 摘要外, 各方法均接受时间筛选参数:</p>
 * <ul>
 *   <li>{@code period}: today/week/month/quarter/year, 为空按 month 处理。</li>
 *   <li>{@code startDate}/{@code endDate}: 自定义区间 (yyyy-MM-dd), 同时非空时覆盖 period。</li>
 * </ul>
 */
public interface CockpitService {
    CockpitKpiVO getKpi(String period, String startDate, String endDate);
    List<RevenueTrendVO> getRevenueTrend(String period, String startDate, String endDate);
    List<CustomerSourceVO> getCustomerSource(String period, String startDate, String endDate);
    List<SalesRankVO> getSalesRank(String period, String startDate, String endDate);
    List<RecentEventVO> getRecentEvents(String period, String startDate, String endDate);
    List<RegionDistributionVO> getRegionDistribution(String period, String startDate, String endDate);
    AlertVO getAlerts(String period, String startDate, String endDate);
    AiSummaryVO getAiSummary();
}
