package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.HashMap;
import java.util.Map;

/**
 * 驾驶舱各指标 Service 共用的口径常量与工具方法（时间窗口、增长率、服务类型标签）。
 *
 * <p>拆分后 {@link CockpitServiceImpl} 与 SalesMetricService / TaskMetricService /
 * FinanceMetricService 共用同一套口径, 避免各自复制一份判定标准导致口径漂移。</p>
 */
final class CockpitConstants {

    /** 营收趋势按自然月分桶 */
    static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");
    /** 营收下钻按自然日分桶 */
    static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /** 订单"有效签约"判定: 状态 >= 4 (财务已确认/已完成), 排除草稿/待审批/取消/驳回 */
    static final int ORDER_DEAL_STATUS = 4;
    /** 收款"已确认"状态 */
    static final int RECEIPT_CONFIRMED = 2;

    /** 服务类型编码 -> 中文标签 */
    static final Map<String, String> SERVICE_TYPE_LABELS = new HashMap<>();
    static {
        SERVICE_TYPE_LABELS.put("bookkeeping", "代理记账");
        SERVICE_TYPE_LABELS.put("registration", "工商注册");
        SERVICE_TYPE_LABELS.put("tax", "税务筹划");
        SERVICE_TYPE_LABELS.put("qualification", "资质代办");
        SERVICE_TYPE_LABELS.put("audit", "审计验资");
        SERVICE_TYPE_LABELS.put("cancellation", "注销清算");
        SERVICE_TYPE_LABELS.put("change", "工商变更");
        SERVICE_TYPE_LABELS.put("seal", "刻章服务");
        SERVICE_TYPE_LABELS.put("address", "挂靠地址");
    }

    private CockpitConstants() {
    }

    // ===================== 时间区间工具 =====================

    /** 起止时间(含起、含止), [start, end] 闭区间, 供 between 使用 */
    record Range(LocalDateTime start, LocalDateTime end) {}

    /**
     * 解析时间窗口。自定义区间(startDate 与 endDate 同时非空)优先, 否则按 period。
     */
    static Range resolveRange(String period, String startDate, String endDate) {
        LocalDate today = LocalDate.now();
        if (startDate != null && !startDate.isBlank() && endDate != null && !endDate.isBlank()) {
            LocalDate s = parseDate(startDate, today.withDayOfMonth(1));
            LocalDate e = parseDate(endDate, today);
            if (e.isBefore(s)) {
                LocalDate tmp = s; s = e; e = tmp;
            }
            return new Range(s.atStartOfDay(), e.atTime(23, 59, 59, 999999999));
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
        return new Range(start.atStartOfDay(), end.atTime(23, 59, 59, 999999999));
    }

    private static LocalDate parseDate(String s, LocalDate fallback) {
        try {
            // 兼容 "yyyy-MM-dd" 及前端可能带的时间戳/ISO 串前缀
            return LocalDate.parse(s.trim().substring(0, 10));
        } catch (Exception e) {
            return fallback;
        }
    }

    /** 计算上一周期等长区间, 用于环比/增长率 */
    static Range previousRange(Range cur) {
        Duration span = Duration.between(cur.start(), cur.end());
        LocalDateTime prevEnd = cur.start().minusSeconds(1);
        LocalDateTime prevStart = prevEnd.minus(span);
        return new Range(prevStart, prevEnd);
    }

    /** 增长率(%) = (本期 - 上期) / 上期 * 100, 上期为 0 时返回 0, 保留一位小数 */
    static double growthRate(double cur, double prev) {
        if (prev == 0d) {
            return 0d;
        }
        return BigDecimal.valueOf((cur - prev) / prev * 100d)
                .setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    /** 服务类型编码 -> 中文标签; 空/未知归为"其他" */
    static String serviceTypeLabel(String serviceType) {
        if (serviceType == null || serviceType.isBlank()) {
            return "其他";
        }
        return SERVICE_TYPE_LABELS.getOrDefault(serviceType, "其他");
    }

    static int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (Exception e) {
            return 0;
        }
    }
}
