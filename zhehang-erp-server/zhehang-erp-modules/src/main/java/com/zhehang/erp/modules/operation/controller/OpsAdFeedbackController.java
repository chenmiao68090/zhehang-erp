package com.zhehang.erp.modules.operation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.operation.domain.OpsAdFeedback;
import com.zhehang.erp.modules.operation.mapper.OpsAdFeedbackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 运营服务中心 - 线上投流反馈。实际路径 = /api + /ops/ad-feedback/... */
@RestController
@RequestMapping("/ops/ad-feedback")
@RequiredArgsConstructor
public class OpsAdFeedbackController {

    private final OpsAdFeedbackMapper feedbackMapper;

    @GetMapping("/list")
    public R<IPage<OpsAdFeedback>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<OpsAdFeedback> wrapper = buildQuery(startDate, endDate, platform, keyword);
        wrapper.orderByDesc(OpsAdFeedback::getFeedbackDate).orderByDesc(OpsAdFeedback::getCreateTime);
        return R.ok(feedbackMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/summary")
    public R<Map<String, Object>> summary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String keyword) {
        List<OpsAdFeedback> rows = feedbackMapper.selectList(buildQuery(startDate, endDate, platform, keyword));
        Map<String, Object> data = new HashMap<>();
        data.put("totalLeads", sumInt(rows, OpsAdFeedback::getTotalLeads));
        data.put("validLeads", sumInt(rows, OpsAdFeedback::getValidLeads));
        data.put("invalidLeads", sumInt(rows, OpsAdFeedback::getInvalidLeads));
        data.put("conversionCount", sumInt(rows, OpsAdFeedback::getConversionCount));
        data.put("spendAmount", sumMoney(rows, OpsAdFeedback::getSpendAmount));
        data.put("revenueAmount", sumMoney(rows, OpsAdFeedback::getRevenueAmount));
        data.put("validRate", percent(sumInt(rows, OpsAdFeedback::getValidLeads), sumInt(rows, OpsAdFeedback::getTotalLeads)));
        data.put("costPerLead", divide(sumMoney(rows, OpsAdFeedback::getSpendAmount), sumInt(rows, OpsAdFeedback::getTotalLeads)));
        data.put("roi", divide(sumMoney(rows, OpsAdFeedback::getRevenueAmount), sumMoney(rows, OpsAdFeedback::getSpendAmount)));
        data.put("byPlatform", byPlatform(rows));
        data.put("byDay", byDay(rows));
        data.put("alerts", buildAlerts(rows));
        return R.ok(data);
    }

    @PostMapping
    @Log(module = "运营投流反馈", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody OpsAdFeedback feedback) {
        normalize(feedback);
        feedback.setId(null);
        feedbackMapper.insert(feedback);
        return R.ok(feedback.getId());
    }

    @PutMapping
    @Log(module = "运营投流反馈", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody OpsAdFeedback feedback) {
        if (feedback == null || feedback.getId() == null) {
            return R.fail("缺少反馈记录ID");
        }
        normalize(feedback);
        feedbackMapper.updateById(feedback);
        return R.ok(feedback.getId());
    }

    @DeleteMapping("/{id}")
    @Log(module = "运营投流反馈", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        feedbackMapper.deleteById(id);
        return R.ok();
    }

    private LambdaQueryWrapper<OpsAdFeedback> buildQuery(String startDate, String endDate, String platform, String keyword) {
        LocalDate start = parseDate(startDate);
        LocalDate end = parseDate(endDate);
        LambdaQueryWrapper<OpsAdFeedback> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(start != null, OpsAdFeedback::getFeedbackDate, start)
                .le(end != null, OpsAdFeedback::getFeedbackDate, end)
                .eq(StringUtils.hasText(platform), OpsAdFeedback::getPlatform, platform)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(OpsAdFeedback::getPlatform, keyword)
                        .or().like(OpsAdFeedback::getAccountName, keyword)
                        .or().like(OpsAdFeedback::getCampaignName, keyword)
                        .or().like(OpsAdFeedback::getOwnerName, keyword));
        return wrapper;
    }

    private void normalize(OpsAdFeedback feedback) {
        if (feedback == null) {
            throw new IllegalArgumentException("反馈内容不能为空");
        }
        if (feedback.getFeedbackDate() == null) {
            feedback.setFeedbackDate(LocalDate.now());
        }
        if (!StringUtils.hasText(feedback.getPlatform())) {
            feedback.setPlatform("未填写平台");
        }
        feedback.setSpendAmount(nonNullMoney(feedback.getSpendAmount()));
        feedback.setRevenueAmount(nonNullMoney(feedback.getRevenueAmount()));
        feedback.setTotalLeads(nonNegative(feedback.getTotalLeads()));
        feedback.setValidLeads(nonNegative(feedback.getValidLeads()));
        feedback.setInvalidLeads(nonNegative(feedback.getInvalidLeads()));
        feedback.setConversionCount(nonNegative(feedback.getConversionCount()));
        int detailTotal = feedback.getValidLeads() + feedback.getInvalidLeads();
        if (feedback.getTotalLeads() == 0 && detailTotal > 0) {
            feedback.setTotalLeads(detailTotal);
        }
        if (feedback.getTotalLeads() < detailTotal) {
            feedback.setTotalLeads(detailTotal);
        }
        if (!StringUtils.hasText(feedback.getStatus())) {
            feedback.setStatus("normal");
        }
    }

    private List<Map<String, Object>> byPlatform(List<OpsAdFeedback> rows) {
        Map<String, List<OpsAdFeedback>> grouped = new LinkedHashMap<>();
        rows.stream()
                .sorted(Comparator.comparing(OpsAdFeedback::getPlatform, Comparator.nullsLast(String::compareTo)))
                .forEach(row -> grouped.computeIfAbsent(row.getPlatform(), key -> new ArrayList<>()).add(row));
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, List<OpsAdFeedback>> entry : grouped.entrySet()) {
            List<OpsAdFeedback> group = entry.getValue();
            int total = sumInt(group, OpsAdFeedback::getTotalLeads);
            int valid = sumInt(group, OpsAdFeedback::getValidLeads);
            BigDecimal spend = sumMoney(group, OpsAdFeedback::getSpendAmount);
            BigDecimal revenue = sumMoney(group, OpsAdFeedback::getRevenueAmount);
            Map<String, Object> item = new HashMap<>();
            item.put("platform", entry.getKey());
            item.put("totalLeads", total);
            item.put("validLeads", valid);
            item.put("invalidLeads", sumInt(group, OpsAdFeedback::getInvalidLeads));
            item.put("conversionCount", sumInt(group, OpsAdFeedback::getConversionCount));
            item.put("spendAmount", spend);
            item.put("revenueAmount", revenue);
            item.put("validRate", percent(valid, total));
            item.put("costPerLead", divide(spend, total));
            item.put("roi", divide(revenue, spend));
            list.add(item);
        }
        list.sort((a, b) -> ((BigDecimal) b.get("spendAmount")).compareTo((BigDecimal) a.get("spendAmount")));
        return list;
    }

    private List<Map<String, Object>> byDay(List<OpsAdFeedback> rows) {
        Map<LocalDate, List<OpsAdFeedback>> grouped = new LinkedHashMap<>();
        rows.stream()
                .sorted(Comparator.comparing(OpsAdFeedback::getFeedbackDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(row -> grouped.computeIfAbsent(row.getFeedbackDate(), key -> new ArrayList<>()).add(row));
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<LocalDate, List<OpsAdFeedback>> entry : grouped.entrySet()) {
            List<OpsAdFeedback> group = entry.getValue();
            Map<String, Object> item = new HashMap<>();
            item.put("date", entry.getKey());
            item.put("totalLeads", sumInt(group, OpsAdFeedback::getTotalLeads));
            item.put("validLeads", sumInt(group, OpsAdFeedback::getValidLeads));
            item.put("invalidLeads", sumInt(group, OpsAdFeedback::getInvalidLeads));
            item.put("spendAmount", sumMoney(group, OpsAdFeedback::getSpendAmount));
            list.add(item);
        }
        return list;
    }

    private List<String> buildAlerts(List<OpsAdFeedback> rows) {
        List<String> alerts = new ArrayList<>();
        int total = sumInt(rows, OpsAdFeedback::getTotalLeads);
        int invalid = sumInt(rows, OpsAdFeedback::getInvalidLeads);
        BigDecimal invalidRate = percent(invalid, total);
        if (invalidRate.compareTo(new BigDecimal("20")) >= 0) {
            alerts.add("无效率已达到 " + invalidRate + "%，建议复盘来源、落地页和客服首响。");
        }
        BigDecimal cpl = divide(sumMoney(rows, OpsAdFeedback::getSpendAmount), total);
        if (cpl.compareTo(new BigDecimal("180")) >= 0) {
            alerts.add("单客资成本约 " + cpl + " 元，建议检查高消耗低转化计划。");
        }
        if (rows.isEmpty()) {
            alerts.add("当前筛选范围还没有投流反馈，请先录入今天的平台数据。");
        }
        if (alerts.isEmpty()) {
            alerts.add("当前投流反馈平稳，建议继续保持每日复盘。");
        }
        return alerts;
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private BigDecimal nonNullMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.max(BigDecimal.ZERO);
    }

    private Integer nonNegative(Integer value) {
        return value == null ? 0 : Math.max(value, 0);
    }

    private BigDecimal percent(int part, int total) {
        if (total <= 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(part).multiply(new BigDecimal("100")).divide(new BigDecimal(total), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal divide(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal divide(BigDecimal numerator, int denominator) {
        if (denominator <= 0) {
            return BigDecimal.ZERO;
        }
        return numerator.divide(new BigDecimal(denominator), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumMoney(List<OpsAdFeedback> rows, MoneyGetter getter) {
        return rows.stream()
                .map(getter::get)
                .map(this::nonNullMoney)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int sumInt(List<OpsAdFeedback> rows, IntGetter getter) {
        return rows.stream().map(getter::get).map(this::nonNegative).reduce(0, Integer::sum);
    }

    private interface MoneyGetter {
        BigDecimal get(OpsAdFeedback row);
    }

    private interface IntGetter {
        Integer get(OpsAdFeedback row);
    }
}
