package com.zhehang.erp.modules.dashboard.cockpit.service;

import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import java.util.List;

public interface CockpitService {
    CockpitKpiVO getKpi();
    List<RevenueTrendVO> getRevenueTrend();
    List<CustomerSourceVO> getCustomerSource();
    List<SalesRankVO> getSalesRank();
    List<RecentEventVO> getRecentEvents();
    List<RegionDistributionVO> getRegionDistribution();
    AlertVO getAlerts();
    AiSummaryVO getAiSummary();
}
