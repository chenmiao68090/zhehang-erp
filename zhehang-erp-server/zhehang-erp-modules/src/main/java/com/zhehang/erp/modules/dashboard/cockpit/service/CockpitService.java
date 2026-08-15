package com.zhehang.erp.modules.dashboard.cockpit.service;

import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import java.util.List;
import java.util.Map;

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
    List<RevenueDrillVO> getRevenueDrill(String month);
    List<CustomerSourceVO> getCustomerSource(String period, String startDate, String endDate);
    List<SalesRankVO> getSalesRank(String period, String startDate, String endDate);
    List<RecentEventVO> getRecentEvents(String period, String startDate, String endDate);
    List<RegionDistributionVO> getRegionDistribution(String period, String startDate, String endDate);
    AlertVO getAlerts(String period, String startDate, String endDate);
    AiSummaryVO getAiSummary();

    /**
     * 业绩看板: 按服务类型(serviceType)统计已到款金额。
     *
     * @param period month/year, 为空按 year 处理。year=今年1/1起, month=本月1日起。
     * @param scope  作用域: "person"=只看当前用户作为业务员的订单; team/空/其它=全公司。
     * @return {@code {total: 全部到款合计(BigDecimal), lines: List<Map>每项{name:中文标签, amount:该线到款合计} 按 amount 倒序}}
     */
    Map<String, Object> getBizPerf(String period, String scope);

    /**
     * 业绩排行: 按业务员统计区间内已到款(finance_confirm_time 落区间)金额/单数,
     * 名次与上一等长周期对比。到款口径与 getBizPerf 完全一致(payable_amount)。
     *
     * @param startDate yyyy-MM-dd, 为空默认本月1日
     * @param endDate   yyyy-MM-dd, 为空默认今天
     * @return {@code {list: [{userId,name,deptName,amount,orderCount,avgAmount,share,rank,prevRank}], me:{rank,amount,orderCount,total}, teamTotal}}
     */
    Map<String, Object> getPerfRank(String startDate, String endDate);
}
