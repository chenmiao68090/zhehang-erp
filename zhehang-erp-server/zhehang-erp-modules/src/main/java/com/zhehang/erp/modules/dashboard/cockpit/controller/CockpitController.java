package com.zhehang.erp.modules.dashboard.cockpit.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<CockpitKpiVO> getKpi(@RequestParam(required = false, defaultValue = "month") String period,
                                  @RequestParam(required = false) String startDate,
                                  @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getKpi(period, startDate, endDate));
    }

    @GetMapping("/revenue-trend")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<RevenueTrendVO>> getRevenueTrend(@RequestParam(required = false, defaultValue = "month") String period,
                                                   @RequestParam(required = false) String startDate,
                                                   @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRevenueTrend(period, startDate, endDate));
    }

    @GetMapping("/revenue-drill")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<RevenueDrillVO>> getRevenueDrill(@RequestParam String month) {
        return R.ok(cockpitService.getRevenueDrill(month));
    }

    @GetMapping("/customer-source")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
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
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<RecentEventVO>> getRecentEvents(@RequestParam(required = false, defaultValue = "month") String period,
                                                  @RequestParam(required = false) String startDate,
                                                  @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRecentEvents(period, startDate, endDate));
    }

    @GetMapping("/region-distribution")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<RegionDistributionVO>> getRegionDistribution(@RequestParam(required = false, defaultValue = "month") String period,
                                                               @RequestParam(required = false) String startDate,
                                                               @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getRegionDistribution(period, startDate, endDate));
    }

    @GetMapping("/alerts")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<AlertVO> getAlerts(@RequestParam(required = false, defaultValue = "month") String period,
                                @RequestParam(required = false) String startDate,
                                @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getAlerts(period, startDate, endDate));
    }

    @PostMapping("/ai-summary")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<AiSummaryVO> getAiSummary() {
        return R.ok(cockpitService.getAiSummary());
    }

    /**
     * 业绩看板: 按服务类型统计已到款(财务已确认)金额。
     *
     * @param period month/year, 为空默认 year。
     */
    @GetMapping("/biz-perf")
    public R<Map<String, Object>> getBizPerf(@RequestParam(required = false, defaultValue = "year") String period,
                                             @RequestParam(required = false) String scope) {
        return R.ok(cockpitService.getBizPerf(period, scope));
    }

    /**
     * 业绩排行(我的结果页): 按业务员统计区间内已到款(财务已确认)金额/单数,
     * 并与上一等长周期对比名次升降。全员可见,与通话排行同权限口径。
     *
     * @param startDate yyyy-MM-dd, 为空默认本月1日
     * @param endDate   yyyy-MM-dd, 为空默认今天
     */
    @GetMapping("/perf-rank")
    public R<Map<String, Object>> getPerfRank(@RequestParam(required = false) String startDate,
                                              @RequestParam(required = false) String endDate) {
        return R.ok(cockpitService.getPerfRank(startDate, endDate));
    }
}
