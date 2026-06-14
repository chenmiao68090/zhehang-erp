package com.zhehang.erp.modules.dashboard.cockpit.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 经营驾驶舱。
 *
 * <p>所有指标端点统一支持时间筛选参数:</p>
 * <ul>
 *   <li>{@code period}: today/week/month/quarter/year, 默认 month。</li>
 *   <li>{@code startDate}/{@code endDate}: 自定义区间 (yyyy-MM-dd), 同时传入时优先于 period。</li>
 * </ul>
 */
@RestController
@RequestMapping("/dashboard/cockpit")
@RequiredArgsConstructor
public class CockpitController {

    private final CockpitService cockpitService;

    @GetMapping("/kpi")
    public R<CockpitKpiVO> getKpi(@RequestParam(required = false, defaultValue = "month") String period,
                                  @RequestParam(required = false) String startDate,
                                  @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getKpi(period, startDate, endDate));
    }

    @GetMapping("/revenue-trend")
    public R<List<RevenueTrendVO>> getRevenueTrend(@RequestParam(required = false, defaultValue = "month") String period,
                                                   @RequestParam(required = false) String startDate,
                                                   @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRevenueTrend(period, startDate, endDate));
    }

    @GetMapping("/customer-source")
    public R<List<CustomerSourceVO>> getCustomerSource(@RequestParam(required = false, defaultValue = "month") String period,
                                                       @RequestParam(required = false) String startDate,
                                                       @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getCustomerSource(period, startDate, endDate));
    }

    @GetMapping("/sales-rank")
    public R<List<SalesRankVO>> getSalesRank(@RequestParam(required = false, defaultValue = "month") String period,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getSalesRank(period, startDate, endDate));
    }

    @GetMapping("/recent-events")
    public R<List<RecentEventVO>> getRecentEvents(@RequestParam(required = false, defaultValue = "month") String period,
                                                  @RequestParam(required = false) String startDate,
                                                  @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRecentEvents(period, startDate, endDate));
    }

    @GetMapping("/region-distribution")
    public R<List<RegionDistributionVO>> getRegionDistribution(@RequestParam(required = false, defaultValue = "month") String period,
                                                               @RequestParam(required = false) String startDate,
                                                               @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRegionDistribution(period, startDate, endDate));
    }

    @GetMapping("/alerts")
    public R<AlertVO> getAlerts(@RequestParam(required = false, defaultValue = "month") String period,
                                @RequestParam(required = false) String startDate,
                                @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getAlerts(period, startDate, endDate));
    }

    @PostMapping("/ai-summary")
    public R<AiSummaryVO> getAiSummary() {
        return R.ok(cockpitService.getAiSummary());
    }
}
