package com.zhehang.erp.modules.analysis.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.analysis.mapper.AnalysisMapper;
import com.zhehang.erp.modules.analysis.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 经营分析实现:按月补齐 12 个月,数字来自真实业务表(订单/收款/续费/客户/线索)。
 */
@Service
@RequiredArgsConstructor
public class AnalysisServiceImpl implements AnalysisService {

    private final AnalysisMapper analysisMapper;

    @Override
    public Map<String, Object> overview(int year) {
        List<Map<String, Object>> months = new ArrayList<>();
        Map<Integer, BigDecimal> receipt = toMonthMap(analysisMapper.monthlyReceipt(year), "amount");
        Map<Integer, Long> customers = toMonthLongMap(analysisMapper.monthlyNewCustomers(year));
        Map<Integer, Map<String, Object>> orders = toMonthOrderMap(analysisMapper.monthlyOrders(year));
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", m);
            item.put("receipt", receipt.getOrDefault(m, BigDecimal.ZERO));
            item.put("newCustomers", customers.getOrDefault(m, 0L));
            item.put("orderCount", orders.containsKey(m) ? orders.get(m).get("cnt") : 0L);
            item.put("orderAmount", orders.containsKey(m) ? orders.get(m).get("amount") : BigDecimal.ZERO);
            months.add(item);
        }
        Map<String, Object> data = new HashMap<>();
        data.put("year", year);
        data.put("months", months);
        return data;
    }

    @Override
    public Map<String, Object> newOrders(int year, Integer month) {
        Map<String, Object> data = new HashMap<>();
        data.put("year", year);
        data.put("month", month);
        data.put("detail", analysisMapper.newOrderDetail(year, month));
        return data;
    }

    @Override
    public Map<String, Object> renewal(int year) {
        Map<String, Object> data = new HashMap<>();
        data.put("year", year);
        data.put("monthly", analysisMapper.monthlyRenewalOrders(year));
        data.put("receivableSummary", analysisMapper.receivableSummary());
        data.put("receivableMonthly", analysisMapper.receivableMonthly(year));
        return data;
    }

    @Override
    public Map<String, Object> loss() {
        Map<String, Object> data = new HashMap<>();
        data.put("asOf", LocalDate.now().toString());
        data.put("list", analysisMapper.lossRisk());
        data.put("count", analysisMapper.lossRisk().size());
        return data;
    }

    @Override
    public Map<String, Object> customerValue() {
        Map<String, Object> data = new HashMap<>();
        data.put("bands", analysisMapper.customerValue());
        return data;
    }

    @Override
    public Map<String, Object> leadRoi(String start, String end) {
        Map<String, Object> data = new HashMap<>();
        data.put("start", start);
        data.put("end", end);
        data.put("leads", analysisMapper.leadRoi(start, end));
        data.put("customers", analysisMapper.customerSource(start, end));
        return data;
    }

    @Override
    public Map<String, Object> sales(int year) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文,请重新登录");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("year", year);
        data.put("funnel", analysisMapper.leadFunnel());
        data.put("follows", analysisMapper.monthlyFollows(year));
        data.put("calls", analysisMapper.monthlyCalls(year, tenantId));
        data.put("effort", analysisMapper.salesEffort(year, tenantId));
        return data;
    }

    private Map<Integer, BigDecimal> toMonthMap(List<Map<String, Object>> rows, String valueKey) {
        Map<Integer, BigDecimal> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Integer m = toInt(row.get("m"));
            if (m != null) {
                result.put(m, toDecimal(row.get(valueKey)));
            }
        }
        return result;
    }

    private Map<Integer, Long> toMonthLongMap(List<Map<String, Object>> rows) {
        Map<Integer, Long> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Integer m = toInt(row.get("m"));
            if (m != null) {
                result.put(m, toLong(row.get("cnt")));
            }
        }
        return result;
    }

    private Map<Integer, Map<String, Object>> toMonthOrderMap(List<Map<String, Object>> rows) {
        Map<Integer, Map<String, Object>> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Integer m = toInt(row.get("m"));
            if (m != null) {
                result.put(m, row);
            }
        }
        return result;
    }

    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        return Integer.valueOf(o.toString());
    }

    private Long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return ((Number) o).longValue();
        return Long.valueOf(o.toString());
    }

    private BigDecimal toDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        return new BigDecimal(o.toString());
    }
}
