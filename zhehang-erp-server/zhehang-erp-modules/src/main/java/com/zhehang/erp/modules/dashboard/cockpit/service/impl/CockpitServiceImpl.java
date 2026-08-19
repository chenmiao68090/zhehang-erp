package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.DAY_FMT;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.MONTH_FMT;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.Range;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.previousRange;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.resolveRange;

/**
 * 经营驾驶舱实现 —— 全部指标从业务表实时聚合, 并随时间筛选(period / 自定义区间)变化。
 *
 * <p>本类只做"解析时间窗口 + 按维度调度 + 组装 VO"; 具体取数按指标维度下沉到
 * {@link SalesMetricService}(客户/订单/合同/业绩)、{@link TaskMetricService}(任务动态/人力)、
 * {@link FinanceMetricService}(回款/应收)。共用口径常量与工具见 {@link CockpitConstants}。</p>
 *
 * <p>多租户: 各 biz/crm/org 表均含 tenant_id, MyBatis-Plus 的 TenantLineInnerInterceptor
 * 会自动追加 tenant_id 过滤, 此处无需手工拼租户条件。</p>
 *
 * <p>未做缓存: 结果随 period 变化, 且为实时经营数据, 不再使用 @Cacheable, 避免不同时段命中同一缓存。</p>
 */
@Service
@RequiredArgsConstructor
public class CockpitServiceImpl implements CockpitService {

    private final AiService aiService;
    private final SalesMetricService salesMetricService;
    private final TaskMetricService taskMetricService;
    private final FinanceMetricService financeMetricService;

    // ===================== KPI =====================

    @Override
    public CockpitKpiVO getKpi(String period, String startDate, String endDate) {
        Range cur = resolveRange(period, startDate, endDate);
        Range prev = previousRange(cur);
        CockpitKpiVO vo = new CockpitKpiVO();
        salesMetricService.fillCustomerKpi(vo, cur, prev);
        salesMetricService.fillRevenueKpi(vo, cur, prev);
        financeMetricService.fillReceiptKpi(vo, cur, prev);
        salesMetricService.fillPendingOrderKpi(vo, cur, prev);
        taskMetricService.fillEmployeeKpi(vo, cur, prev);
        return vo;
    }

    // ===================== 营收趋势 =====================

    @Override
    public List<RevenueTrendVO> getRevenueTrend(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        // 营收(有效签约订单实付额) 与 回款(已确认收款) 按自然月分桶, 至少覆盖区间起止月份
        Map<String, BigDecimal> revenue = salesMetricService.sumDealOrderAmountByBucket(r.start(), r.end(), MONTH_FMT);
        Map<String, BigDecimal> receipt =
                financeMetricService.sumConfirmedReceiptAmountByBucket(r.start(), r.end(), MONTH_FMT);

        List<RevenueTrendVO> list = new ArrayList<>();
        LocalDate cursor = r.start().toLocalDate().withDayOfMonth(1);
        LocalDate last = r.end().toLocalDate().withDayOfMonth(1);
        while (!cursor.isAfter(last)) {
            String key = cursor.format(MONTH_FMT);
            list.add(new RevenueTrendVO(key,
                    revenue.getOrDefault(key, BigDecimal.ZERO),
                    receipt.getOrDefault(key, BigDecimal.ZERO)));
            cursor = cursor.plusMonths(1);
        }
        return list;
    }

    @Override
    public List<RevenueDrillVO> getRevenueDrill(String month) {
        // month=yyyy-MM；解析当月日范围,按日分桶(过滤条件与 getRevenueTrend 完全一致,仅分桶粒度月→日)
        YearMonth ym;
        try {
            ym = YearMonth.parse(month);
        } catch (Exception e) {
            throw new BusinessException("month 参数格式错误,应为 yyyy-MM");
        }
        LocalDate first = ym.atDay(1);
        LocalDate lastDay = ym.atEndOfMonth();
        LocalDateTime start = first.atStartOfDay();
        LocalDateTime end = lastDay.atTime(23, 59, 59, 999999999);

        Map<String, BigDecimal> revenue = salesMetricService.sumDealOrderAmountByBucket(start, end, DAY_FMT);
        Map<String, BigDecimal> receipt = financeMetricService.sumConfirmedReceiptAmountByBucket(start, end, DAY_FMT);

        List<RevenueDrillVO> list = new ArrayList<>();
        LocalDate cursor = first;
        while (!cursor.isAfter(lastDay)) {
            String key = cursor.format(DAY_FMT);
            list.add(new RevenueDrillVO(key,
                    revenue.getOrDefault(key, BigDecimal.ZERO),
                    receipt.getOrDefault(key, BigDecimal.ZERO)));
            cursor = cursor.plusDays(1);
        }
        return list;
    }

    // ===================== 客户来源 / 业绩排行 / 区域分布 / 最新动态 =====================

    @Override
    public List<CustomerSourceVO> getCustomerSource(String period, String startDate, String endDate) {
        return salesMetricService.getCustomerSource(resolveRange(period, startDate, endDate));
    }

    @Override
    public List<SalesRankVO> getSalesRank(String period, String startDate, String endDate) {
        return salesMetricService.getSalesRank(resolveRange(period, startDate, endDate));
    }

    @Override
    public List<RegionDistributionVO> getRegionDistribution(String period, String startDate, String endDate) {
        return salesMetricService.getRegionDistribution(resolveRange(period, startDate, endDate));
    }

    @Override
    public List<RecentEventVO> getRecentEvents(String period, String startDate, String endDate) {
        return taskMetricService.getRecentEvents(resolveRange(period, startDate, endDate));
    }

    // ===================== 预警 =====================

    @Override
    public AlertVO getAlerts(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        AlertVO vo = new AlertVO();

        // 逾期应收: 区间内仍处于"待确认"(status=1)的收款记录, 视为未到账, 计数 + 金额合计
        FinanceMetricService.PendingReceiptStat pending = financeMetricService.pendingReceiptStat(r);
        vo.setOverdueReceiptCount(pending.count());
        vo.setOverdueReceiptAmount(pending.amount());

        // 风险客户 / 即将到期合同 / 异常审批
        salesMetricService.fillSalesAlerts(vo, r);

        // 库存预警: 驾驶舱无对应库存/地址资源数据源, 置 0(诚实留空, 不硬造)
        vo.setStockWarningCount(0);

        return vo;
    }

    // ===================== AI 摘要(原样保留, 文本生成无结构化数据源) =====================

    @Override
    public AiSummaryVO getAiSummary() {
        // 用真实 KPI 拼提示词, 让摘要随实际经营数据变化(默认本月口径)
        CockpitKpiVO kpi = getKpi("month", null, null);
        AlertVO alert = getAlerts("month", null, null);
        String prompt = "请根据以下财税公司经营数据生成一份简洁的CEO经营分析摘要（Markdown格式）：\n"
                + "服务客户" + kpi.getTotalCustomers() + "家，本月新签客户" + kpi.getNewCustomersMonth() + "家，"
                + "本月签约额" + scaleWan(kpi.getTotalRevenue()) + "万，本月回款" + scaleWan(kpi.getMonthReceipt()) + "万，"
                + "待签订单" + kpi.getPendingContracts() + "份，在岗人员" + kpi.getTotalEmployees() + "人，"
                + "待确认收款" + alert.getOverdueReceiptCount() + "笔，风险客户" + alert.getRiskCustomerCount() + "家，"
                + "30天内到期合同" + alert.getExpiringContractCount() + "份，异常审批" + alert.getAbnormalApprovalCount() + "单。";
        try {
            String reply = aiService.chat(prompt, new HashMap<>());
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent(reply);
            vo.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider(aiService.getProviderName());
            return vo;
        } catch (Exception e) {
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent("## 经营摘要\n\n### 核心指标\n- 服务客户：**" + kpi.getTotalCustomers() + "家**\n"
                    + "- 本月签约额：**￥" + scaleWan(kpi.getTotalRevenue()) + "万**\n"
                    + "- 本月回款：**￥" + scaleWan(kpi.getMonthReceipt()) + "万**\n"
                    + "- 在岗人员：**" + kpi.getTotalEmployees() + "人**\n\n"
                    + "### 风险提示\n- 待确认收款 **" + alert.getOverdueReceiptCount() + "笔**，建议财务尽快核销\n"
                    + "- 风险客户 **" + alert.getRiskCustomerCount() + "家**，建议客户成功分层回访\n"
                    + "- 30天内到期合同 **" + alert.getExpiringContractCount() + "份**，建议提前发起续签\n\n"
                    + "### 建议行动\n1. 优先处理逾期应收与到期合同，保障回款与续费\n"
                    + "2. 关注异常审批订单，缩短交付周期\n"
                    + "3. 持续补充线索来源，稳定新签增长");
            vo.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider("fallback");
            return vo;
        }
    }

    private String scaleWan(BigDecimal amount) {
        if (amount == null) return "0";
        return amount.divide(BigDecimal.valueOf(10000), 1, RoundingMode.HALF_UP).toPlainString();
    }

    // ===================== 业绩看板 =====================

    @Override
    public Map<String, Object> getBizPerf(String period, String scope) {
        return salesMetricService.getBizPerf(period, scope);
    }

    @Override
    public Map<String, Object> getPerfRank(String startDate, String endDate) {
        return salesMetricService.getPerfRank(startDate, endDate);
    }
}
