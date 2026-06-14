package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;

/**
 * 经营驾驶舱实现 —— 全部指标从业务表实时聚合, 并随时间筛选(period / 自定义区间)变化。
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
    private final CrmCustomerMapper customerMapper;
    private final CrmLeadMapper leadMapper;
    private final BizOrderMapper orderMapper;
    private final BizReceiptMapper receiptMapper;
    private final BizContractMapper contractMapper;
    private final BizTaskMapper taskMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final SysDeptMapper deptMapper;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    /** 订单"有效签约"判定: 状态 >= 4 (财务已确认/已完成), 排除草稿/待审批/取消/驳回 */
    private static final int ORDER_DEAL_STATUS = 4;
    /** 收款"已确认"状态 */
    private static final int RECEIPT_CONFIRMED = 2;

    // ===================== 时间区间工具 =====================

    /** 起止时间(含起、含止), [start, end] 闭区间, 供 between 使用 */
    private record Range(LocalDateTime start, LocalDateTime end) {}

    /**
     * 解析时间窗口。自定义区间(startDate 与 endDate 同时非空)优先, 否则按 period。
     */
    private Range resolveRange(String period, String startDate, String endDate) {
        LocalDate today = LocalDate.now();
        if (startDate != null && !startDate.isBlank() && endDate != null && !endDate.isBlank()) {
            LocalDate s = parseDate(startDate, today.withDayOfMonth(1));
            LocalDate e = parseDate(endDate, today);
            if (e.isBefore(s)) {
                LocalDate tmp = s; s = e; e = tmp;
            }
            return new Range(s.atStartOfDay(), e.atTime(23, 59, 59));
        }
        String p = (period == null || period.isBlank()) ? "month" : period.trim().toLowerCase();
        LocalDate start;
        LocalDate end = today;
        switch (p) {
            case "today" -> start = today;
            case "week" -> start = today.with(java.time.DayOfWeek.MONDAY);
            case "quarter" -> start = today.with(IsoFields.DAY_OF_QUARTER, 1L);
            case "year" -> start = today.withDayOfYear(1);
            case "month" -> start = today.withDayOfMonth(1);
            default -> start = today.withDayOfMonth(1);
        }
        return new Range(start.atStartOfDay(), end.atTime(23, 59, 59));
    }

    private LocalDate parseDate(String s, LocalDate fallback) {
        try {
            // 兼容 "yyyy-MM-dd" 及前端可能带的时间戳/ISO 串前缀
            return LocalDate.parse(s.trim().substring(0, 10));
        } catch (Exception e) {
            return fallback;
        }
    }

    /** 计算上一周期等长区间, 用于环比/增长率 */
    private Range previousRange(Range cur) {
        Duration span = Duration.between(cur.start(), cur.end());
        LocalDateTime prevEnd = cur.start().minusSeconds(1);
        LocalDateTime prevStart = prevEnd.minus(span);
        return new Range(prevStart, prevEnd);
    }

    /** 增长率(%) = (本期 - 上期) / 上期 * 100, 上期为 0 时返回 0, 保留一位小数 */
    private double growthRate(double cur, double prev) {
        if (prev == 0d) {
            return 0d;
        }
        return BigDecimal.valueOf((cur - prev) / prev * 100d)
                .setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    // ===================== KPI =====================

    @Override
    public CockpitKpiVO getKpi(String period, String startDate, String endDate) {
        Range cur = resolveRange(period, startDate, endDate);
        Range prev = previousRange(cur);
        CockpitKpiVO vo = new CockpitKpiVO();

        // 客户总数(快照, 不随区间变) + 区间内新增客户增长率
        long totalCustomers = customerMapper.selectCount(null);
        long newCustCur = customerMapper.selectCount(
                new LambdaQueryWrapper<CrmCustomer>().between(CrmCustomer::getCreateTime, cur.start(), cur.end()));
        long newCustPrev = customerMapper.selectCount(
                new LambdaQueryWrapper<CrmCustomer>().between(CrmCustomer::getCreateTime, prev.start(), prev.end()));
        vo.setTotalCustomers((int) totalCustomers);
        vo.setCustomerGrowthRate(growthRate(totalCustomers, totalCustomers - newCustCur));
        vo.setNewCustomersMonth((int) newCustCur);
        vo.setNewCustomerGrowthRate(growthRate(newCustCur, newCustPrev));

        // 业绩金额(区间内有效签约订单实付额合计) + 环比
        BigDecimal revenueCur = sumOrderAmount(cur);
        BigDecimal revenuePrev = sumOrderAmount(prev);
        vo.setTotalRevenue(revenueCur);
        vo.setRevenueGrowthRate(growthRate(revenueCur.doubleValue(), revenuePrev.doubleValue()));

        // 回款金额(区间内已确认收款合计) + 环比
        BigDecimal receiptCur = sumReceiptAmount(cur);
        BigDecimal receiptPrev = sumReceiptAmount(prev);
        vo.setMonthReceipt(receiptCur);
        vo.setReceiptGrowthRate(growthRate(receiptCur.doubleValue(), receiptPrev.doubleValue()));

        // 待签/待审批订单(状态2待审批, 快照) + 环比(按区间内进入待审批的数量近似)
        long pending = orderMapper.selectCount(
                new LambdaQueryWrapper<BizOrder>().eq(BizOrder::getStatus, 2));
        long pendingCreatedCur = orderMapper.selectCount(
                new LambdaQueryWrapper<BizOrder>().eq(BizOrder::getStatus, 2)
                        .between(BizOrder::getCreateTime, cur.start(), cur.end()));
        long pendingCreatedPrev = orderMapper.selectCount(
                new LambdaQueryWrapper<BizOrder>().eq(BizOrder::getStatus, 2)
                        .between(BizOrder::getCreateTime, prev.start(), prev.end()));
        vo.setPendingContracts((int) pending);
        vo.setPendingContractsRate(growthRate(pendingCreatedCur, pendingCreatedPrev));

        // 在岗员工(状态1在职, 快照) + 区间内入职带来的增长率
        long onDuty = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().eq(OrgEmployee::getStatus, 1));
        long hiredCur = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().between(OrgEmployee::getCreateTime, cur.start(), cur.end()));
        long hiredPrev = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().between(OrgEmployee::getCreateTime, prev.start(), prev.end()));
        vo.setTotalEmployees((int) onDuty);
        vo.setEmployeeGrowthRate(growthRate(hiredCur, hiredPrev));

        return vo;
    }

    /** 区间内有效签约订单实付金额合计 */
    private BigDecimal sumOrderAmount(Range r) {
        List<BizOrder> orders = orderMapper.selectList(
                new LambdaQueryWrapper<BizOrder>()
                        .ge(BizOrder::getStatus, ORDER_DEAL_STATUS)
                        .ne(BizOrder::getStatus, 6) // 排除已取消
                        .between(BizOrder::getCreateTime, r.start(), r.end()));
        BigDecimal sum = BigDecimal.ZERO;
        for (BizOrder o : orders) {
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : o.getTotalAmount();
            if (amt != null) {
                sum = sum.add(amt);
            }
        }
        return sum;
    }

    /** 区间内已确认收款金额合计 */
    private BigDecimal sumReceiptAmount(Range r) {
        List<BizReceipt> receipts = receiptMapper.selectList(
                new LambdaQueryWrapper<BizReceipt>()
                        .eq(BizReceipt::getStatus, RECEIPT_CONFIRMED)
                        .between(BizReceipt::getCreateTime, r.start(), r.end()));
        BigDecimal sum = BigDecimal.ZERO;
        for (BizReceipt re : receipts) {
            if (re.getAmount() != null) {
                sum = sum.add(re.getAmount());
            }
        }
        return sum;
    }

    // ===================== 营收趋势 =====================

    @Override
    public List<RevenueTrendVO> getRevenueTrend(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        // 按"自然月"分桶, 至少覆盖区间起止月份
        LinkedHashMap<String, BigDecimal[]> buckets = new LinkedHashMap<>();
        LocalDate cursor = r.start().toLocalDate().withDayOfMonth(1);
        LocalDate last = r.end().toLocalDate().withDayOfMonth(1);
        while (!cursor.isAfter(last)) {
            buckets.put(cursor.format(MONTH_FMT), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            cursor = cursor.plusMonths(1);
        }

        // 营收: 区间内有效签约订单, 按创建月累加实付额
        List<BizOrder> orders = orderMapper.selectList(
                new LambdaQueryWrapper<BizOrder>()
                        .ge(BizOrder::getStatus, ORDER_DEAL_STATUS)
                        .ne(BizOrder::getStatus, 6)
                        .between(BizOrder::getCreateTime, r.start(), r.end()));
        for (BizOrder o : orders) {
            if (o.getCreateTime() == null) continue;
            String key = o.getCreateTime().toLocalDate().format(MONTH_FMT);
            BigDecimal[] cell = buckets.get(key);
            if (cell == null) continue;
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : o.getTotalAmount();
            if (amt != null) cell[0] = cell[0].add(amt);
        }

        // 回款: 区间内已确认收款, 按创建月累加
        List<BizReceipt> receipts = receiptMapper.selectList(
                new LambdaQueryWrapper<BizReceipt>()
                        .eq(BizReceipt::getStatus, RECEIPT_CONFIRMED)
                        .between(BizReceipt::getCreateTime, r.start(), r.end()));
        for (BizReceipt re : receipts) {
            if (re.getCreateTime() == null) continue;
            String key = re.getCreateTime().toLocalDate().format(MONTH_FMT);
            BigDecimal[] cell = buckets.get(key);
            if (cell == null) continue;
            if (re.getAmount() != null) cell[1] = cell[1].add(re.getAmount());
        }

        List<RevenueTrendVO> list = new ArrayList<>();
        buckets.forEach((month, v) -> list.add(new RevenueTrendVO(month, v[0], v[1])));
        return list;
    }

    // ===================== 客户来源分布 =====================

    @Override
    public List<CustomerSourceVO> getCustomerSource(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        // 区间内新增客户, 按 source 分组计数
        QueryWrapper<CrmCustomer> qw = new QueryWrapper<>();
        qw.select("source AS source", "COUNT(*) AS cnt")
                .between("create_time", r.start(), r.end())
                .groupBy("source")
                .orderByDesc("cnt");
        List<Map<String, Object>> rows = customerMapper.selectMaps(qw);
        List<CustomerSourceVO> list = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Object src = row.get("source");
            String label = (src == null || String.valueOf(src).isBlank()) ? "未知来源" : String.valueOf(src);
            int cnt = toInt(row.get("cnt"));
            list.add(new CustomerSourceVO(label, cnt));
        }
        return list;
    }

    // ===================== 业绩排行 =====================

    @Override
    public List<SalesRankVO> getSalesRank(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        // 区间内有效签约订单, 按销售员聚合实付额; 上期同口径用于增长率
        Map<Long, double[]> agg = new HashMap<>();      // salesmanId -> [本期金额]
        Map<Long, String> nameMap = new HashMap<>();
        Map<Long, Long> deptMap = new HashMap<>();

        List<BizOrder> curOrders = orderMapper.selectList(
                new LambdaQueryWrapper<BizOrder>()
                        .ge(BizOrder::getStatus, ORDER_DEAL_STATUS)
                        .ne(BizOrder::getStatus, 6)
                        .isNotNull(BizOrder::getSalesmanId)
                        .between(BizOrder::getCreateTime, r.start(), r.end()));
        for (BizOrder o : curOrders) {
            Long sid = o.getSalesmanId();
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : o.getTotalAmount();
            if (sid == null || amt == null) continue;
            agg.computeIfAbsent(sid, k -> new double[]{0d})[0] += amt.doubleValue();
            nameMap.putIfAbsent(sid, o.getSalesmanName());
            if (o.getDeptId() != null) deptMap.putIfAbsent(sid, o.getDeptId());
        }

        Range prev = previousRange(r);
        Map<Long, Double> prevAgg = new HashMap<>();
        List<BizOrder> prevOrders = orderMapper.selectList(
                new LambdaQueryWrapper<BizOrder>()
                        .ge(BizOrder::getStatus, ORDER_DEAL_STATUS)
                        .ne(BizOrder::getStatus, 6)
                        .isNotNull(BizOrder::getSalesmanId)
                        .between(BizOrder::getCreateTime, prev.start(), prev.end()));
        for (BizOrder o : prevOrders) {
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : o.getTotalAmount();
            if (o.getSalesmanId() == null || amt == null) continue;
            prevAgg.merge(o.getSalesmanId(), amt.doubleValue(), Double::sum);
        }

        // 销售员所属部门ID -> 部门名称(sys_dept)
        Map<Long, String> deptNameMap = resolveDeptNames(new HashSet<>(deptMap.values()));

        List<SalesRankVO> list = new ArrayList<>();
        agg.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue()[0], a.getValue()[0]))
                .limit(10)
                .forEach(e -> {
                    Long sid = e.getKey();
                    double curAmt = e.getValue()[0];
                    double prevAmt = prevAgg.getOrDefault(sid, 0d);
                    Long deptId = deptMap.get(sid);
                    String dept = deptId != null ? deptNameMap.getOrDefault(deptId, "部门" + deptId) : "";
                    list.add(new SalesRankVO(
                            list.size() + 1,
                            nameMap.getOrDefault(sid, "销售" + sid),
                            dept,
                            BigDecimal.valueOf(curAmt).setScale(2, RoundingMode.HALF_UP),
                            growthRate(curAmt, prevAmt)));
                });
        return list;
    }

    /** 按部门ID批量取部门名称(sys_dept.dept_name); 查不到的由调用方退化为"部门{ID}"占位 */
    private Map<Long, String> resolveDeptNames(Set<Long> deptIds) {
        if (deptIds == null || deptIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<SysDept> depts = deptMapper.selectList(
                new LambdaQueryWrapper<SysDept>().in(SysDept::getId, deptIds));
        Map<Long, String> map = new HashMap<>();
        for (SysDept d : depts) {
            map.put(d.getId(), d.getDeptName());
        }
        return map;
    }

    // ===================== 区域分布 =====================

    @Override
    public List<RegionDistributionVO> getRegionDistribution(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        // 线索表带"注册区域(region)", 按区间内新增线索的区域分组计数
        QueryWrapper<CrmLead> qw = new QueryWrapper<>();
        qw.select("region AS region", "COUNT(*) AS cnt")
                .between("create_time", r.start(), r.end())
                .isNotNull("region")
                .ne("region", "")
                .groupBy("region")
                .orderByDesc("cnt");
        List<Map<String, Object>> rows = leadMapper.selectMaps(qw);
        List<RegionDistributionVO> list = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Object region = row.get("region");
            if (region == null || String.valueOf(region).isBlank()) continue;
            list.add(new RegionDistributionVO(String.valueOf(region), toInt(row.get("cnt"))));
        }
        return list;
    }

    // ===================== 最新动态 =====================

    @Override
    public List<RecentEventVO> getRecentEvents(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        List<RecentEventVO> events = new ArrayList<>();

        // 区间内的任务作为事件来源, 取最近 20 条, 按创建时间倒序
        List<BizTask> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<BizTask>()
                        .between(BizTask::getCreateTime, r.start(), r.end())
                        .orderByDesc(BizTask::getCreateTime)
                        .last("LIMIT 20"));
        for (BizTask t : tasks) {
            events.add(new RecentEventVO(
                    mapTaskType(t.getTaskType()),
                    buildTaskContent(t),
                    relativeTime(t.getCreateTime()),
                    t.getExecutorName() != null ? t.getExecutorName() : "系统"));
        }
        return events;
    }

    private String mapTaskType(String taskType) {
        if (taskType == null) return "follow";
        return switch (taskType) {
            case "followup" -> "follow";
            case "service" -> "follow";
            case "audit" -> "alert";
            default -> "follow";
        };
    }

    private String buildTaskContent(BizTask t) {
        StringBuilder sb = new StringBuilder();
        if (t.getTitle() != null && !t.getTitle().isBlank()) {
            sb.append(t.getTitle());
        } else {
            sb.append("任务").append(t.getTaskNo() != null ? t.getTaskNo() : "");
        }
        if (t.getDescription() != null && !t.getDescription().isBlank()) {
            sb.append(" - ").append(t.getDescription());
        }
        return sb.toString();
    }

    /** 相对时间文案: 刚刚 / N分钟前 / N小时前 / N天前 */
    private String relativeTime(LocalDateTime time) {
        if (time == null) return "";
        Duration d = Duration.between(time, LocalDateTime.now());
        long mins = d.toMinutes();
        if (mins < 1) return "刚刚";
        if (mins < 60) return mins + "分钟前";
        long hours = d.toHours();
        if (hours < 24) return hours + "小时前";
        return d.toDays() + "天前";
    }

    // ===================== 预警 =====================

    @Override
    public AlertVO getAlerts(String period, String startDate, String endDate) {
        Range r = resolveRange(period, startDate, endDate);
        AlertVO vo = new AlertVO();

        // 逾期应收: 区间内仍处于"待确认"(status=1)的收款记录, 视为未到账, 计数 + 金额合计
        List<BizReceipt> pendingReceipts = receiptMapper.selectList(
                new LambdaQueryWrapper<BizReceipt>()
                        .eq(BizReceipt::getStatus, 1)
                        .between(BizReceipt::getCreateTime, r.start(), r.end()));
        BigDecimal overdueAmount = BigDecimal.ZERO;
        for (BizReceipt re : pendingReceipts) {
            if (re.getAmount() != null) overdueAmount = overdueAmount.add(re.getAmount());
        }
        vo.setOverdueReceiptCount(pendingReceipts.size());
        vo.setOverdueReceiptAmount(overdueAmount);

        // 风险客户: 禁用状态(status=1)客户数(快照)
        long riskCustomers = customerMapper.selectCount(
                new LambdaQueryWrapper<CrmCustomer>().eq(CrmCustomer::getStatus, 1));
        vo.setRiskCustomerCount((int) riskCustomers);

        // 即将到期合同: 30 天内到期(endDate 在 [今天, 今天+30]) 且未终止(status != 7) 的合同数(快照)
        LocalDate today = LocalDate.now();
        long expiring = contractMapper.selectCount(
                new LambdaQueryWrapper<BizContract>()
                        .between(BizContract::getEndDate, today, today.plusDays(30))
                        .ne(BizContract::getStatus, 7));
        vo.setExpiringContractCount((int) expiring);

        // 库存预警: 驾驶舱无对应库存/地址资源数据源, 置 0(诚实留空, 不硬造)
        vo.setStockWarningCount(0);

        // 异常审批: 区间内被驳回(status=7)的订单数
        long abnormal = orderMapper.selectCount(
                new LambdaQueryWrapper<BizOrder>()
                        .eq(BizOrder::getStatus, 7)
                        .between(BizOrder::getCreateTime, r.start(), r.end()));
        vo.setAbnormalApprovalCount((int) abnormal);

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

    private int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (Exception e) {
            return 0;
        }
    }
}
