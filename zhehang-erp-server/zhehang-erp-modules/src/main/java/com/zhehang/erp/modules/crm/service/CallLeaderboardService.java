package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.vo.CallLeaderboardVO;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * 全公司通话排行。
 *
 * <p>所有用户、映射和话单聚合都在查询入口显式限定当前租户。</p>
 */
@Service
@RequiredArgsConstructor
public class CallLeaderboardService {

    static final int DAILY_TARGET = 400;

    private final BizCallRecordMapper callRecordMapper;
    private final BizYunkeUserMapMapper yunkeUserMapMapper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;

    public CallLeaderboardVO getLeaderboard(String requestedPeriod, String requestedMetric) {
        return getLeaderboard(requestedPeriod, requestedMetric, null, null);
    }

    public CallLeaderboardVO getLeaderboard(String requestedPeriod, String requestedMetric,
                                              LocalDate requestedStartDate, LocalDate requestedEndDate) {
        PeriodRange period = resolvePeriod(requestedPeriod, requestedStartDate, requestedEndDate);
        Metric metric = Metric.from(requestedMetric);
        Long tenantId = requireTenantId();

        List<SysUser> users = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .select(SysUser::getId, SysUser::getUsername, SysUser::getNickname,
                        SysUser::getPhone, SysUser::getDeptId, SysUser::getStatus)
                .eq(SysUser::getTenantId, tenantId));
        Map<Long, SysUser> usersById = new LinkedHashMap<>();
        for (SysUser user : users) {
            if (user.getId() != null) {
                usersById.put(user.getId(), user);
            }
        }

        Map<Long, String> deptNames = loadDeptNames(users, tenantId);
        Map<String, Long> uniqueTokenOwners = buildUniqueTokenOwners(users);
        List<BizYunkeUserMap> mappings = yunkeUserMapMapper.selectList(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, tenantId));
        mergeMappingTokens(uniqueTokenOwners, mappings);

        Map<Long, Accumulator> grouped = new LinkedHashMap<>();
        for (Map<String, Object> source : loadAggregates(period, tenantId)) {
            Long rawAgentId = nullableLong(source.get("agentId"));
            String rawAgentName = text(source.get("agentName"));
            Long userId = usersById.containsKey(rawAgentId) ? rawAgentId : uniqueTokenOwners.get(normalizeToken(rawAgentName));
            if (userId == null || !usersById.containsKey(userId)) {
                continue;
            }
            Accumulator target = grouped.computeIfAbsent(userId, id -> new Accumulator(id));
            target.callCount += longVal(source.get("callCount"));
            target.connectedCount += longVal(source.get("connectedCount"));
            target.validCount += longVal(source.get("validCount"));
            target.totalDuration += longVal(source.get("totalDuration"));
        }

        long targetCount = (long) DAILY_TARGET * period.days();
        List<Accumulator> sorted = new ArrayList<>(grouped.values());
        sorted.sort((left, right) -> compareRows(left, right, metric, usersById));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<CallLeaderboardVO.Row> rows = new ArrayList<>();
        CallLeaderboardVO.Row self = null;
        for (int index = 0; index < sorted.size(); index++) {
            Accumulator item = sorted.get(index);
            CallLeaderboardVO.Row row = toRow(item, usersById.get(item.userId), deptNames,
                    index + 1, targetCount, item.userId.equals(currentUserId));
            rows.add(row);
            if (Boolean.TRUE.equals(row.getCurrentUser())) {
                self = row;
            }
        }

        if (self == null) {
            self = emptySelf(usersById.get(currentUserId), deptNames, currentUserId, targetCount);
        }

        CallLeaderboardVO result = new CallLeaderboardVO();
        result.setPeriod(period.key());
        result.setMetric(metric.key);
        result.setStartDate(period.startDate());
        result.setEndDate(period.endDate());
        result.setTargetPerDay(DAILY_TARGET);
        result.setPeriodDays(period.days());
        result.setTargetCount(targetCount);
        result.setGapUnit(metric.unit);
        result.setGapToPrevious(gapToPrevious(self, rows, metric));
        result.setSelf(self);
        result.setRows(rows);
        return result;
    }

    private List<Map<String, Object>> loadAggregates(PeriodRange period, Long tenantId) {
        QueryWrapper<BizCallRecord> query = new QueryWrapper<BizCallRecord>()
                .select("agent_id AS agentId",
                        "TRIM(agent_name) AS agentName",
                        "COUNT(1) AS callCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 THEN 1 ELSE 0 END), 0) AS connectedCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 AND duration >= 60 THEN 1 ELSE 0 END), 0) AS validCount",
                        "COALESCE(SUM(duration), 0) AS totalDuration")
                .eq("tenant_id", tenantId)
                .in("call_type", "manual", "platform")
                .ge("call_time", period.start())
                .lt("call_time", period.end())
                .groupBy("agent_id", "TRIM(agent_name)");
        List<Map<String, Object>> rows = callRecordMapper.selectMaps(query);
        return rows == null ? List.of() : rows;
    }

    private Map<Long, String> loadDeptNames(List<SysUser> users, Long tenantId) {
        Set<Long> deptIds = new HashSet<>();
        for (SysUser user : users) {
            if (user.getDeptId() != null) {
                deptIds.add(user.getDeptId());
            }
        }
        Map<Long, String> result = new HashMap<>();
        if (deptIds.isEmpty()) {
            return result;
        }
        deptMapper.selectList(new LambdaQueryWrapper<SysDept>()
                        .select(SysDept::getId, SysDept::getDeptName)
                        .eq(SysDept::getTenantId, tenantId)
                        .in(SysDept::getId, deptIds))
                .forEach(dept -> result.put(dept.getId(), dept.getDeptName()));
        return result;
    }

    private Map<String, Long> buildUniqueTokenOwners(List<SysUser> users) {
        Map<String, Set<Long>> owners = new HashMap<>();
        for (SysUser user : users) {
            addTokenOwner(owners, user.getNickname(), user.getId());
            addTokenOwner(owners, user.getUsername(), user.getId());
            addTokenOwner(owners, user.getPhone(), user.getId());
        }
        return uniqueOwners(owners);
    }

    private void mergeMappingTokens(Map<String, Long> existing, List<BizYunkeUserMap> mappings) {
        Map<String, Set<Long>> owners = new HashMap<>();
        existing.forEach((token, userId) -> addTokenOwner(owners, token, userId));
        for (BizYunkeUserMap mapping : mappings) {
            Long userId = mapping.getUserId();
            if (userId == null) {
                continue;
            }
            addTokenOwner(owners, mapping.getUserName(), userId);
            addTokenOwner(owners, mapping.getUserPhone(), userId);
            addTokenOwner(owners, mapping.getYunkeUserId(), userId);
            addTokenOwner(owners, mapping.getYunkePhone(), userId);
            addTokenOwner(owners, mapping.getYunkeNickname(), userId);
        }
        existing.clear();
        existing.putAll(uniqueOwners(owners));
    }

    private void addTokenOwner(Map<String, Set<Long>> owners, String value, Long userId) {
        String token = normalizeToken(value);
        if (!StringUtils.hasText(token) || userId == null) {
            return;
        }
        owners.computeIfAbsent(token, ignored -> new HashSet<>()).add(userId);
    }

    private Map<String, Long> uniqueOwners(Map<String, Set<Long>> owners) {
        Map<String, Long> unique = new HashMap<>();
        owners.forEach((token, userIds) -> {
            if (userIds.size() == 1) {
                unique.put(token, userIds.iterator().next());
            }
        });
        return unique;
    }

    private int compareRows(Accumulator left, Accumulator right, Metric metric, Map<Long, SysUser> users) {
        int primary = Double.compare(metricValue(right, metric), metricValue(left, metric));
        if (primary != 0) return primary;
        int calls = Long.compare(right.callCount, left.callCount);
        if (calls != 0) return calls;
        int connected = Long.compare(right.connectedCount, left.connectedCount);
        if (connected != 0) return connected;
        return displayName(users.get(left.userId)).compareTo(displayName(users.get(right.userId)));
    }

    private CallLeaderboardVO.Row toRow(Accumulator value, SysUser user, Map<Long, String> deptNames,
                                         int rank, long targetCount, boolean currentUser) {
        CallLeaderboardVO.Row row = new CallLeaderboardVO.Row();
        row.setRank(rank);
        row.setUserId(value.userId);
        row.setAgentName(displayName(user));
        row.setDeptName(user != null && user.getDeptId() != null
                ? deptNames.getOrDefault(user.getDeptId(), "未设置部门") : "未设置部门");
        row.setCallCount(value.callCount);
        row.setConnectedCount(value.connectedCount);
        row.setConnectRate(rate(value.connectedCount, value.callCount));
        row.setValidCount(value.validCount);
        row.setValidRate(rate(value.validCount, value.callCount));
        row.setTotalDuration(value.totalDuration);
        row.setTotalDurationText(formatDuration(value.totalDuration));
        row.setTargetCount(targetCount);
        row.setTargetProgress(rate(value.callCount, targetCount));
        row.setCurrentUser(currentUser);
        return row;
    }

    private CallLeaderboardVO.Row emptySelf(SysUser user, Map<Long, String> deptNames,
                                             Long currentUserId, long targetCount) {
        CallLeaderboardVO.Row row = new CallLeaderboardVO.Row();
        row.setUserId(currentUserId);
        row.setAgentName(user == null ? SecurityUtils.getCurrentUsername() : displayName(user));
        row.setDeptName(user != null && user.getDeptId() != null
                ? deptNames.getOrDefault(user.getDeptId(), "未设置部门") : "未设置部门");
        row.setCallCount(0L);
        row.setConnectedCount(0L);
        row.setConnectRate(0D);
        row.setValidCount(0L);
        row.setValidRate(0D);
        row.setTotalDuration(0L);
        row.setTotalDurationText("0:00:00");
        row.setTargetCount(targetCount);
        row.setTargetProgress(0D);
        row.setCurrentUser(true);
        return row;
    }

    private Double gapToPrevious(CallLeaderboardVO.Row self, List<CallLeaderboardVO.Row> rows, Metric metric) {
        if (self.getRank() == null || self.getRank() > rows.size()) {
            return null;
        }
        double gap;
        if (self.getRank() == 1) {
            gap = rows.size() > 1
                    ? Math.max(rowMetricValue(self, metric) - rowMetricValue(rows.get(1), metric), 0D)
                    : 0D;
        } else {
            CallLeaderboardVO.Row previous = rows.get(self.getRank() - 2);
            gap = Math.max(rowMetricValue(previous, metric) - rowMetricValue(self, metric), 0D);
        }
        return metric == Metric.CONNECT_RATE ? round1(gap) : (double) Math.round(gap);
    }

    private double metricValue(Accumulator value, Metric metric) {
        return switch (metric) {
            case EFFECTIVE -> value.validCount;
            case CONNECT_RATE -> rate(value.connectedCount, value.callCount);
            default -> value.callCount;
        };
    }

    private double rowMetricValue(CallLeaderboardVO.Row row, Metric metric) {
        return switch (metric) {
            case EFFECTIVE -> row.getValidCount();
            case CONNECT_RATE -> row.getConnectRate();
            default -> row.getCallCount();
        };
    }

    private PeriodRange resolvePeriod(String requested, LocalDate requestedStartDate, LocalDate requestedEndDate) {
        LocalDate today = LocalDate.now();
        if (requestedStartDate != null || requestedEndDate != null) {
            LocalDate startDate = requestedStartDate == null ? requestedEndDate : requestedStartDate;
            LocalDate endDate = requestedEndDate == null ? requestedStartDate : requestedEndDate;
            if (startDate.isAfter(endDate)) {
                throw new BusinessException("开始日期不能晚于结束日期");
            }
            if (endDate.isAfter(today)) {
                throw new BusinessException("结束日期不能晚于今天");
            }
            long rangeDays = ChronoUnit.DAYS.between(startDate, endDate) + 1L;
            if (rangeDays > 366L) {
                throw new BusinessException("日期范围最多选择366天");
            }
            return new PeriodRange("custom", startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay(),
                    (int) rangeDays, startDate, endDate);
        }

        String key = requested == null ? "today" : requested.trim().toLowerCase(Locale.ROOT);
        LocalDate startDate = switch (key) {
            case "week" -> today.minusDays(today.getDayOfWeek().getValue() - 1L);
            case "month" -> today.withDayOfMonth(1);
            default -> today;
        };
        String normalized = "week".equals(key) || "month".equals(key) ? key : "today";
        int days = (int) ChronoUnit.DAYS.between(startDate, today) + 1;
        return new PeriodRange(normalized, startDate.atStartOfDay(), today.plusDays(1).atStartOfDay(),
                days, startDate, today);
    }

    private String displayName(SysUser user) {
        if (user == null) return "未知坐席";
        if (StringUtils.hasText(user.getNickname())) return user.getNickname().trim();
        if (StringUtils.hasText(user.getUsername())) return user.getUsername().trim();
        return "未知坐席";
    }

    private String normalizeToken(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String text(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Long nullableLong(Object value) {
        if (value == null) return null;
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private long longVal(Object value) {
        Long parsed = nullableLong(value);
        return parsed == null ? 0L : parsed;
    }

    private double rate(long numerator, long denominator) {
        if (denominator <= 0) return 0D;
        return round1(numerator * 100D / denominator);
    }

    private double round1(double value) {
        return Math.round(value * 10D) / 10D;
    }

    private String formatDuration(long totalSeconds) {
        long safe = Math.max(totalSeconds, 0L);
        long hours = safe / 3600;
        long minutes = (safe % 3600) / 60;
        long seconds = safe % 60;
        return String.format(Locale.ROOT, "%d:%02d:%02d", hours, minutes, seconds);
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文,请重新登录");
        }
        return tenantId;
    }

    private enum Metric {
        CALLS("calls", "通"),
        EFFECTIVE("effective", "通"),
        CONNECT_RATE("connectRate", "%");

        private final String key;
        private final String unit;

        Metric(String key, String unit) {
            this.key = key;
            this.unit = unit;
        }

        private static Metric from(String value) {
            if ("effective".equalsIgnoreCase(value)) return EFFECTIVE;
            if ("connectRate".equalsIgnoreCase(value)) return CONNECT_RATE;
            return CALLS;
        }
    }

    private record PeriodRange(String key, LocalDateTime start, LocalDateTime end, int days,
                               LocalDate startDate, LocalDate endDate) { }

    private static final class Accumulator {
        private final Long userId;
        private long callCount;
        private long connectedCount;
        private long validCount;
        private long totalDuration;

        private Accumulator(Long userId) {
            this.userId = userId;
        }
    }
}
