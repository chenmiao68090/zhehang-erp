package com.zhehang.erp.modules.dashboard.cockpit.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard/cockpit")
@RequiredArgsConstructor
public class CockpitController {

    private final CockpitService cockpitService;

    @GetMapping("/kpi")
    public R<CockpitKpiVO> getKpi() {
        return R.ok(cockpitService.getKpi());
    }

    @GetMapping("/revenue-trend")
    public R<List<RevenueTrendVO>> getRevenueTrend() {
        return R.ok(cockpitService.getRevenueTrend());
    }

    @GetMapping("/customer-source")
    public R<List<CustomerSourceVO>> getCustomerSource() {
        return R.ok(cockpitService.getCustomerSource());
    }

    @GetMapping("/sales-rank")
    public R<List<SalesRankVO>> getSalesRank() {
        return R.ok(cockpitService.getSalesRank());
    }

    @GetMapping("/recent-events")
    public R<List<RecentEventVO>> getRecentEvents() {
        return R.ok(cockpitService.getRecentEvents());
    }

    @GetMapping("/region-distribution")
    public R<List<RegionDistributionVO>> getRegionDistribution() {
        return R.ok(cockpitService.getRegionDistribution());
    }

    @GetMapping("/alerts")
    public R<AlertVO> getAlerts() {
        return R.ok(cockpitService.getAlerts());
    }

    @PostMapping("/ai-summary")
    public R<AiSummaryVO> getAiSummary() {
        return R.ok(cockpitService.getAiSummary());
    }
}
