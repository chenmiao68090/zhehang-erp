package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.AlertVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CockpitKpiVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CustomerSourceVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.RegionDistributionVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.SalesRankVO;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.ORDER_DEAL_STATUS;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.Range;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.growthRate;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.previousRange;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.serviceTypeLabel;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.toInt;

/**
 * 驾驶舱销售指标: 客户/线索、签约金额、待审批订单、业绩排行与服务线到款。
 *
 * <p>仅被 {@link CockpitServiceImpl} 聚合调用, 故不单独定义接口。</p>
 */
@Service
@RequiredArgsConstructor
class SalesMetricService {

    private final CrmCustomerMapper customerMapper;
    private final CrmLeadMapper leadMapper;
    private final BizOrderMapper orderMapper;
    private final BizContractMapper contractMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final SysDeptMapper deptMapper;

    // ===================== KPI 分片 =====================

    /** 客户总数(快照, 不随区间变) + 区间内新增客户增长率 */
    void fillCustomerKpi(CockpitKpiVO vo, Range cur, Range prev) {
        long totalCustomers = customerMapper.selectCount(null);
        long newCustCur = customerMapper.selectCount(
                new LambdaQueryWrapper<CrmCustomer>().between(CrmCustomer::getCreateTime, cur.start(), cur.end()));
        long newCustPrev = customerMapper.selectCount(
                new LambdaQueryWrapper<CrmCustomer>().between(CrmCustomer::getCreateTime, prev.start(), prev.end()));
        vo.setTotalCustomers((int) totalCustomers);
        vo.setCustomerGrowthRate(growthRate(totalCustomers, totalCustomers - newCustCur));
        vo.setNewCustomersMonth((int) newCustCur);
        vo.setNewCustomerGrowthRate(growthRate(newCustCur, newCustPrev));
    }

    /** 业绩金额(区间内有效签约订单实付额合计) + 环比 */
    void fillRevenueKpi(CockpitKpiVO vo, Range cur, Range prev) {
        BigDecimal revenueCur = sumOrderAmount(cur);
        BigDecimal revenuePrev = sumOrderAmount(prev);
        vo.setTotalRevenue(revenueCur);
        vo.setRevenueGrowthRate(growthRate(revenueCur.doubleValue(), revenuePrev.doubleValue()));
    }

    /** 待签/待审批订单(状态2待审批, 快照) + 环比(按区间内进入待审批的数量近似) */
    void fillPendingOrderKpi(CockpitKpiVO vo, Range cur, Range prev) {
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
    }

    /** 区间内有效签约订单实付金额合计 */
    private BigDecimal sumOrderAmount(Range r) {
        // DB 聚合替代拉全表到内存累加:COALESCE(payable,total) 与原"payable优先,否则total"逐条逻辑等价
        QueryWrapper<BizOrder> qw = new QueryWrapper<>();
        qw.select("COALESCE(SUM(COALESCE(payable_amount, total_amount)), 0) AS total")
          .ge("status", ORDER_DEAL_STATUS)
          .ne("status", 6)
          .between("create_time", r.start(), r.end());
        List<Map<String, Object>> rows = orderMapper.selectMaps(qw);
        Object total = rows.isEmpty() ? null : rows.get(0).get("total");
        return total == null ? BigDecimal.ZERO : new BigDecimal(total.toString());
    }

    // ===================== 营收趋势/下钻 =====================

    /**
     * 区间内有效签约订单(status>=4 且 !=6)按创建时间分桶累加实付额(payable 优先否则 total),
     * 桶键由 fmt 决定(月/日粒度)。创建时间为空的记录跳过。
     */
    Map<String, BigDecimal> sumDealOrderAmountByBucket(LocalDateTime start, LocalDateTime end,
                                                       DateTimeFormatter fmt) {
        List<BizOrder> orders = orderMapper.selectList(
                new LambdaQueryWrapper<BizOrder>()
                        .ge(BizOrder::getStatus, ORDER_DEAL_STATUS)
                        .ne(BizOrder::getStatus, 6)
                        .between(BizOrder::getCreateTime, start, end));
        Map<String, BigDecimal> buckets = new LinkedHashMap<>();
        for (BizOrder o : orders) {
            if (o.getCreateTime() == null) continue;
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : o.getTotalAmount();
            if (amt == null) continue;
            buckets.merge(o.getCreateTime().toLocalDate().format(fmt), amt, BigDecimal::add);
        }
        return buckets;
    }

    // ===================== 客户来源分布 =====================

    List<CustomerSourceVO> getCustomerSource(Range r) {
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

    List<SalesRankVO> getSalesRank(Range r) {
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

    List<RegionDistributionVO> getRegionDistribution(Range r) {
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

    // ===================== 预警(客户/合同/审批口径) =====================

    /** 风险客户、即将到期合同、异常审批订单三项预警 */
    void fillSalesAlerts(AlertVO vo, Range r) {
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

        // 异常审批: 区间内被驳回(status=7)的订单数
        long abnormal = orderMapper.selectCount(
                new LambdaQueryWrapper<BizOrder>()
                        .eq(BizOrder::getStatus, 7)
                        .between(BizOrder::getCreateTime, r.start(), r.end()));
        vo.setAbnormalApprovalCount((int) abnormal);
    }

    // ===================== 业绩看板: 按服务类型统计已到款金额 =====================

    Map<String, Object> getBizPerf(String period, String scope) {
        // period: month=本月1日起, year(默认)=今年1/1起。区间右端开放(只查已到款且 >= start)
        String p = (period == null || period.isBlank()) ? "year" : period.trim().toLowerCase();
        LocalDate today = LocalDate.now();
        LocalDate startDate = "month".equals(p) ? today.withDayOfMonth(1) : today.withDayOfYear(1);
        LocalDateTime start = startDate.atStartOfDay();

        // 已到款 = 财务确认时间不为空, 且落在区间内
        LambdaQueryWrapper<BizOrder> qw = new LambdaQueryWrapper<BizOrder>()
                .isNotNull(BizOrder::getFinanceConfirmTime)
                .ge(BizOrder::getFinanceConfirmTime, start);
        // 作用域: person=只看自己作为业务员的订单; team/空/其它=全公司
        if ("person".equals(scope)) {
            qw.eq(BizOrder::getSalesmanId, com.zhehang.erp.common.core.utils.SecurityUtils.getCurrentUserId());
        }
        List<BizOrder> orders = orderMapper.selectList(qw);

        // 按 serviceType 中文标签分组累加 payableAmount(空按0)
        Map<String, BigDecimal> grouped = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (BizOrder o : orders) {
            BigDecimal amt = o.getPayableAmount() != null ? o.getPayableAmount() : BigDecimal.ZERO;
            String label = serviceTypeLabel(o.getServiceType());
            grouped.merge(label, amt, BigDecimal::add);
            total = total.add(amt);
        }

        List<Map<String, Object>> lines = new ArrayList<>();
        grouped.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .forEach(e -> {
                    Map<String, Object> line = new LinkedHashMap<>();
                    line.put("name", e.getKey());
                    line.put("amount", e.getValue());
                    lines.add(line);
                });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("lines", lines);
        return result;
    }

    Map<String, Object> getPerfRank(String startDate, String endDate) {
        LocalDate today = LocalDate.now();
        LocalDate start = parsePerfDate(startDate, today.withDayOfMonth(1));
        LocalDate end = parsePerfDate(endDate, today);
        if (end.isBefore(start)) {
            LocalDate t = start; start = end; end = t;
        }
        // 上一等长周期(紧邻本期之前),用于名次升降对比
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(days);
        LocalDate prevEnd = start.minusDays(1);

        Map<Long, PerfAgg> cur = aggregatePerfBySalesman(start, end);
        Map<Long, PerfAgg> prev = aggregatePerfBySalesman(prevStart, prevEnd);

        // 上期名次(金额倒序)
        List<Map.Entry<Long, PerfAgg>> prevOrdered = new ArrayList<>(prev.entrySet());
        prevOrdered.sort((a, b) -> b.getValue().amount.compareTo(a.getValue().amount));
        Map<Long, Integer> prevRankMap = new HashMap<>();
        for (int i = 0; i < prevOrdered.size(); i++) {
            prevRankMap.put(prevOrdered.get(i).getKey(), i + 1);
        }

        // 本期排序 + 团队合计
        List<Map.Entry<Long, PerfAgg>> ordered = new ArrayList<>(cur.entrySet());
        ordered.sort((a, b) -> b.getValue().amount.compareTo(a.getValue().amount));
        BigDecimal teamTotal = BigDecimal.ZERO;
        for (Map.Entry<Long, PerfAgg> e : ordered) {
            teamTotal = teamTotal.add(e.getValue().amount);
        }

        // 姓名/部门批量解析:员工档案优先,订单冗余的 salesman_name 兜底
        Set<Long> userIds = new HashSet<>(cur.keySet());
        Map<Long, OrgEmployee> empByUser = new HashMap<>();
        if (!userIds.isEmpty()) {
            for (OrgEmployee e : employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                    .in(OrgEmployee::getUserId, userIds))) {
                empByUser.putIfAbsent(e.getUserId(), e);
            }
        }
        Set<Long> deptIds = new HashSet<>();
        for (OrgEmployee e : empByUser.values()) {
            if (e.getDeptId() != null) {
                deptIds.add(e.getDeptId());
            }
        }
        Map<Long, String> deptNames = new HashMap<>();
        if (!deptIds.isEmpty()) {
            for (SysDept d : deptMapper.selectBatchIds(deptIds)) {
                deptNames.put(d.getId(), d.getDeptName());
            }
        }

        Long meId = com.zhehang.erp.common.core.utils.SecurityUtils.getCurrentUserId();
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> me = new LinkedHashMap<>();
        me.put("rank", null);
        me.put("amount", BigDecimal.ZERO);
        me.put("orderCount", 0);
        for (int i = 0; i < ordered.size(); i++) {
            Long uid = ordered.get(i).getKey();
            PerfAgg agg = ordered.get(i).getValue();
            OrgEmployee emp = empByUser.get(uid);
            String name = emp != null && emp.getName() != null ? emp.getName()
                    : (agg.name != null ? agg.name : ("用户" + uid));
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", uid);
            row.put("name", name);
            row.put("deptName", emp != null && emp.getDeptId() != null ? deptNames.get(emp.getDeptId()) : null);
            row.put("amount", agg.amount);
            row.put("orderCount", agg.count);
            row.put("avgAmount", agg.count > 0
                    ? agg.amount.divide(BigDecimal.valueOf(agg.count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            row.put("share", teamTotal.signum() > 0
                    ? agg.amount.multiply(BigDecimal.valueOf(100)).divide(teamTotal, 1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            row.put("rank", i + 1);
            row.put("prevRank", prevRankMap.get(uid));
            row.put("prevAmount", prev.containsKey(uid) ? prev.get(uid).amount : null);
            row.put("currentUser", uid.equals(meId));
            list.add(row);
            if (uid.equals(meId)) {
                me.put("rank", i + 1);
                me.put("amount", agg.amount);
                me.put("orderCount", agg.count);
            }
        }
        me.put("total", ordered.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("list", list);
        result.put("me", me);
        result.put("teamTotal", teamTotal);
        result.put("startDate", start.toString());
        result.put("endDate", end.toString());
        return result;
    }

    /** 到款口径与 getBizPerf 完全一致: finance_confirm_time 落区间的订单按 payable_amount 累加,归属 salesman_id */
    private Map<Long, PerfAgg> aggregatePerfBySalesman(LocalDate start, LocalDate end) {
        List<BizOrder> orders = orderMapper.selectList(new LambdaQueryWrapper<BizOrder>()
                .isNotNull(BizOrder::getFinanceConfirmTime)
                .ge(BizOrder::getFinanceConfirmTime, start.atStartOfDay())
                .lt(BizOrder::getFinanceConfirmTime, end.plusDays(1).atStartOfDay())
                .isNotNull(BizOrder::getSalesmanId));
        Map<Long, PerfAgg> map = new HashMap<>();
        for (BizOrder o : orders) {
            PerfAgg agg = map.computeIfAbsent(o.getSalesmanId(), k -> new PerfAgg());
            agg.amount = agg.amount.add(o.getPayableAmount() != null ? o.getPayableAmount() : BigDecimal.ZERO);
            agg.count++;
            if (agg.name == null && o.getSalesmanName() != null && !o.getSalesmanName().isBlank()) {
                agg.name = o.getSalesmanName();
            }
        }
        return map;
    }

    private LocalDate parsePerfDate(String s, LocalDate def) {
        if (s == null || s.isBlank()) {
            return def;
        }
        try {
            return LocalDate.parse(s.trim());
        } catch (Exception e) {
            return def;
        }
    }

    /** 业绩排行聚合中间量 */
    private static class PerfAgg {
        BigDecimal amount = BigDecimal.ZERO;
        int count = 0;
        String name;
    }
}
