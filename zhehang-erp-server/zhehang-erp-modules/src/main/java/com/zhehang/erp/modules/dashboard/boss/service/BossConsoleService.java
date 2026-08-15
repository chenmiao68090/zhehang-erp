package com.zhehang.erp.modules.dashboard.boss.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.dashboard.boss.mapper.BossConsoleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 老板总控台:把 5 个业务域的真实统计 + 异常清单 + 员工执行排行组装成一个响应。
 * 真实无数据统一归零；数据库或数据格式异常必须显式失败，避免把故障伪装成经营数据。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BossConsoleService {

    private final BossConsoleMapper mapper;

    public Map<String, Object> overview() {
        try {
            return loadOverview();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[老板总控台] 数据加载失败", e);
            throw new BusinessException("老板总控台数据加载失败，请稍后重试");
        }
    }

    private Map<String, Object> loadOverview() {
        Map<String, Object> res = new LinkedHashMap<>();

        res.put("customerIssue", normalizeMap(mapper.customerIssueStat(), "todayNew", "unhandled", "overdue", "p0"));
        res.put("bookkeeping", normalizeMap(mapper.bookkeepingStat(), "active", "completed", "processing", "overdue"));

        Map<String, Object> sales = new LinkedHashMap<>();
        sales.put("todayLeads", normalizeLong(mapper.countTodayLeads()));
        sales.put("todayFollows", normalizeLong(mapper.countTodayFollows()));
        sales.put("expectAmount", normalizeAmount(mapper.sumExpectAmount()));
        sales.put("dealAmount", normalizeAmount(mapper.sumDealAmountThisMonth()));
        res.put("sales", sales);

        Map<String, Object> receipt = new LinkedHashMap<>();
        receipt.put("todayDue", normalizeAmount(mapper.sumTodayDue()));
        receipt.put("todayReceived", normalizeAmount(mapper.sumTodayReceived()));
        receipt.put("overdueArrears", normalizeAmount(mapper.sumOverdueArrears()));
        receipt.put("arrearsCount", normalizeLong(mapper.countArrearsCustomers()));
        res.put("receipt", receipt);

        res.put("employees", employees(mapper.employeeExec()));

        Map<String, Object> ex = new LinkedHashMap<>();
        ex.put("overdueIssues", normalizeList(mapper.overdueIssues()));
        ex.put("p0Issues", normalizeList(mapper.p0Issues()));
        ex.put("bookkeepingAbnormal", normalizeList(mapper.bookkeepingAbnormal()));
        ex.put("arrears", normalizeList(mapper.arrearsList()));
        res.put("exceptions", ex);

        return res;
    }

    private List<Map<String, Object>> employees(List<Map<String, Object>> employees) {
        List<Map<String, Object>> list = normalizeList(employees);
        for (Map<String, Object> e : list) {
            long done = toLong(e.get("doneCount"));
            long total = toLong(e.get("totalCount"));
            e.put("doneRate", total > 0 ? Math.round(done * 100.0 / total) : 0);
        }
        return list;
    }

    // —— 仅处理真实空值，不吞查询和数据格式异常 ——

    private Map<String, Object> normalizeMap(Map<String, Object> values, String... keys) {
        Map<String, Object> source = values == null ? new HashMap<>() : values;
        Map<String, Object> out = new LinkedHashMap<>();
        for (String key : keys) {
            out.put(key, toLong(source.get(key)));
        }
        return out;
    }

    private long normalizeLong(Long value) {
        return value == null ? 0L : value;
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private List<Map<String, Object>> normalizeList(List<Map<String, Object>> value) {
        return value == null ? new ArrayList<>() : value;
    }

    private long toLong(Object o) {
        if (o == null) {
            return 0L;
        }
        if (o instanceof Number n) {
            return n.longValue();
        }
        return Long.parseLong(o.toString());
    }
}
