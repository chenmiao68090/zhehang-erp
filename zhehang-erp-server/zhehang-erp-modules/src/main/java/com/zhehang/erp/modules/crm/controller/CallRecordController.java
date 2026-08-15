package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.dto.CallSummaryDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.vo.CallLeaderboardVO;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.CallLeaderboardService;
import com.zhehang.erp.modules.crm.service.CallSummaryService;
import com.zhehang.erp.modules.crm.service.YunkeCallRecordSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 电销通话记录(外呼工作台)。
 */
@RestController
@RequestMapping("/call-record")
@RequiredArgsConstructor
@Slf4j
public class CallRecordController {

    private final BizCallRecordMapper callRecordMapper;
    private final BizYunkeUserMapMapper yunkeUserMapMapper;
    private final CrmLeadMapper leadMapper;
    private final CallSummaryService callSummaryService;
    private final CallLeaderboardService callLeaderboardService;
    private final YunkeCallRecordSyncService yunkeCallRecordSyncService;
    private final com.zhehang.erp.modules.crm.support.DataScopeHelper dataScopeHelper;

    /**
     * 通话记录列表。默认「我的」(只看自己拨打的);scope=all 或按 leadId 查某线索时,按数据范围放开:
     * 老板→全公司、主管→本部门及下级坐席、员工→仍只看自己(agent_id 无 dept_id,走"可见用户ID集")。
     */
    @GetMapping("/list")
    public R<List<BizCallRecord>> list(@RequestParam(required = false) Long leadId,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) String scope,
                                       @RequestParam(required = false) Boolean todayOnly,
                                       @RequestParam(required = false) Integer limit) {
        LambdaQueryWrapper<BizCallRecord> qw = new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, requireTenantId())
                .eq(leadId != null, BizCallRecord::getLeadId, leadId)
                .in(BizCallRecord::getCallType, "manual", "platform");
        if (leadId != null) {
            CrmLead lead = leadMapper.selectOne(new LambdaQueryWrapper<CrmLead>()
                    .eq(CrmLead::getId, leadId)
                    .eq(CrmLead::getTenantId, requireTenantId())
                    .last("LIMIT 1"));
            if (lead == null) {
                return R.ok(java.util.Collections.emptyList());
            }
            if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
                throw new BusinessException("无权查看该线索的通话记录");
            }
        } else {
            applyCallScope(qw, "all".equalsIgnoreCase(scope));
        }
        qw.ge(Boolean.TRUE.equals(todayOnly), BizCallRecord::getCallTime, LocalDate.now().atStartOfDay());
        if (StringUtils.hasText(keyword)) {
            qw.and(w -> w.like(BizCallRecord::getCustomerName, keyword)
                    .or()
                    .like(BizCallRecord::getPhone, keyword));
        }
        qw.orderByDesc(BizCallRecord::getCallTime);
        if (limit != null) {
            qw.last("LIMIT " + Math.max(1, Math.min(limit, 1000)));
        }
        return R.ok(markRecordingAvailability(callRecordMapper.selectList(qw)));
    }

    /**
     * 今日话务统计。默认「我的」;scope=all 按数据范围(老板全公司/主管本部门坐席/员工本人)。
     */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats(@RequestParam(required = false) String scope) {
        LambdaQueryWrapper<BizCallRecord> qw = new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, requireTenantId())
                .ge(BizCallRecord::getCallTime, LocalDate.now().atStartOfDay())
                .in(BizCallRecord::getCallType, "manual", "platform");
        applyCallScope(qw, "all".equalsIgnoreCase(scope));
        List<BizCallRecord> records = callRecordMapper.selectList(qw);

        int callCount = records.size();
        int connectedCount = 0;
        long totalDuration = 0L;
        int over1minCount = 0;
        for (BizCallRecord r : records) {
            if (r.getConnected() != null && r.getConnected() == 1) {
                connectedCount++;
            }
            int dur = r.getDuration() != null ? r.getDuration() : 0;
            totalDuration += dur;
            if (dur >= 60) {
                over1minCount++;
            }
        }
        int connectRate = callCount > 0 ? (int) Math.round(connectedCount * 100.0 / callCount) : 0;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("callCount", callCount);
        data.put("connectedCount", connectedCount);
        data.put("connectRate", connectRate);
        data.put("totalDuration", totalDuration);
        data.put("totalDurationText", formatDuration(totalDuration));
        data.put("over1minCount", over1minCount);
        return R.ok(data);
    }

    /**
     * 今日坐席排行榜。老板看全公司、主管看部门、普通销售只看本人。
     */
    @GetMapping("/agent-rank")
    public R<List<Map<String, Object>>> agentRank() {
        LambdaQueryWrapper<BizCallRecord> qw = new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, requireTenantId())
                .ge(BizCallRecord::getCallTime, LocalDate.now().atStartOfDay())
                .in(BizCallRecord::getCallType, "manual", "platform");
        applyCallScope(qw, true);
        List<BizCallRecord> records = callRecordMapper.selectList(qw);

        Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();
        for (BizCallRecord r : records) {
            String agentName = r.getAgentName();
            Map<String, Object> row = grouped.computeIfAbsent(agentName, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("agentName", k);
                m.put("callCount", 0);
                m.put("connectedCount", 0);
                m.put("totalDuration", 0L);
                return m;
            });
            row.put("callCount", (int) row.get("callCount") + 1);
            if (r.getConnected() != null && r.getConnected() == 1) {
                row.put("connectedCount", (int) row.get("connectedCount") + 1);
            }
            int dur = r.getDuration() != null ? r.getDuration() : 0;
            row.put("totalDuration", (long) row.get("totalDuration") + dur);
        }

        List<Map<String, Object>> result = new ArrayList<>(grouped.values());
        result.sort((a, b) -> Integer.compare((int) b.get("callCount"), (int) a.get("callCount")));
        return R.ok(result);
    }

    /**
     * 销售“我的结果”通话排行。同租户销售体系用户统一看全公司汇总，
     * 只返回人员和统计数，不暴露客户、号码、录音或小结。
     */
    @GetMapping("/leaderboard")
    public R<CallLeaderboardVO> leaderboard(@RequestParam(defaultValue = "today") String period,
                                             @RequestParam(defaultValue = "calls") String metric,
                                             @RequestParam(required = false)
                                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                             @RequestParam(required = false)
                                             @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return R.ok(callLeaderboardService.getLeaderboard(period, metric, startDate, endDate));
    }

    /**
     * 销售体系-电销外呼看板。
     * 聚合云客同步话单(callType=platform),避免前端拉全量记录自行统计。
     */
    @GetMapping("/dashboard")
    public R<Map<String, Object>> dashboard(@RequestParam(defaultValue = "today") String range) {
        TimeRange timeRange = resolveRange(range);
        TimeRange previousRange = resolvePreviousRange(range, timeRange);

        Map<String, Object> summary = loadDashboardSummary(timeRange);
        Map<String, Object> previous = loadDashboardSummary(previousRange);
        List<Map<String, Object>> agents = loadDashboardAgents(timeRange);
        List<Map<String, Object>> trend = loadDashboardTrend(range, timeRange);

        if (!agents.isEmpty()) {
            Map<String, Object> top = agents.get(0);
            summary.put("topAgentName", top.get("agentName"));
            summary.put("topAgentCalls", longVal(top.get("callCount")));
        } else {
            summary.put("topAgentName", "暂无");
            summary.put("topAgentCalls", 0L);
        }

        Map<String, Object> todo = new LinkedHashMap<>();
        todo.put("callbackCount", longVal(summary.get("missedCount")));
        todo.put("highIntentCount", longVal(summary.get("highIntentCount")));
        todo.put("recordReviewCount", longVal(summary.get("recordCount")));
        todo.put("lowConnectAgentCount", agents.stream()
                .filter(a -> doubleVal(a.get("connectRate")) > 0 && doubleVal(a.get("connectRate")) < 35)
                .count());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("range", range);
        data.put("summary", summary);
        data.put("previousSummary", previous);
        data.put("agents", agents);
        data.put("trend", trend);
        data.put("todo", todo);
        return R.ok(data);
    }

    /**
     * 新增通话记录(手动登记)。
     */
    @PostMapping
    @Log(module = "电销通话", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody BizCallRecord record) {
        callSummaryService.saveRecordOnly(record);
        return R.ok();
    }

    /** 保存通话小结并同步形成 CRM 跟进和下一步待办。 */
    @PostMapping("/summary")
    @Log(module = "电销通话", type = Log.OperationType.INSERT)
    public R<Long> saveSummary(@RequestBody CallSummaryDTO summary) {
        return R.ok(callSummaryService.saveSummary(summary));
    }

    /**
     * 外呼(占位):外呼平台未接入,直接返回手动模式。
     */
    @PostMapping("/dial")
    public R<String> dial(@RequestBody Map<String, Object> body) {
        return R.ok("manual");
    }

    /**
     * 云客同步通话记录列表(全公司,不按当前用户过滤)。
     * 数据来自云客「通话记录同步」回调(callType=platform),含通话时长与录音地址。
     * 与 /list(销售看自己手动登记的)区分:此接口给管理端看工作手机同步来的完整话单。
     */
    @GetMapping("/sync-list")
    public R<IPage<BizCallRecord>> syncList(@RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "20") Integer pageSize,
                                            @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<BizCallRecord> qw = new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, requireTenantId())
                .eq(BizCallRecord::getCallType, "platform");
        applyCallScope(qw, true);
        if (StringUtils.hasText(keyword)) {
            qw.and(w -> w.like(BizCallRecord::getPhone, keyword)
                    .or().like(BizCallRecord::getAgentName, keyword)
                    .or().like(BizCallRecord::getCustomerName, keyword));
        }
        qw.orderByDesc(BizCallRecord::getCallTime);
        IPage<BizCallRecord> page = callRecordMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        markRecordingAvailability(page.getRecords());
        return R.ok(page);
    }

    /** 云客同步通话:总量统计(全公司)。 */
    @GetMapping("/sync-stats")
    public R<Map<String, Object>> syncStats() {
        QueryWrapper<BizCallRecord> query = new QueryWrapper<BizCallRecord>()
                .select("COUNT(1) AS total",
                        "COALESCE(SUM(CASE WHEN connected = 1 THEN 1 ELSE 0 END), 0) AS connectedCount",
                        "COALESCE(SUM(duration), 0) AS totalDuration",
                        "COALESCE(SUM(CASE WHEN call_time >= CURDATE() THEN 1 ELSE 0 END), 0) AS todayCount")
                .eq("tenant_id", requireTenantId())
                .eq("call_type", "platform");
        applyCallScope(query);
        List<Map<String, Object>> rows = callRecordMapper.selectMaps(query);
        Map<String, Object> row = rows == null || rows.isEmpty() ? Map.of() : rows.get(0);
        long total = longVal(row.get("total"));
        long connectedCount = longVal(row.get("connectedCount"));
        long totalDuration = longVal(row.get("totalDuration"));
        long todayCount = longVal(row.get("todayCount"));
        int connectRate = total > 0 ? (int) Math.round(connectedCount * 100.0 / total) : 0;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total", total);
        data.put("todayCount", todayCount);
        data.put("connectedCount", connectedCount);
        data.put("connectRate", connectRate);
        data.put("totalDuration", totalDuration);
        data.put("totalDurationText", formatDuration(totalDuration));
        return R.ok(data);
    }

    /**
     * 立即从云客"未同步通话记录"队列补拉一批。
     * 后台定时任务也会自动补拉;这个接口给管理端手动触发。
     */
    @PostMapping("/sync-yunke-failed")
    @Log(module = "云客通话记录", type = Log.OperationType.OTHER)
    public R<Map<String, Object>> syncYunkeFailed(@RequestParam(defaultValue = "20") Integer maxBatches) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail(403, "仅主管、老板或管理员可手动补同步云客话单");
        }
        try {
            int batches = maxBatches == null ? 20 : Math.max(1, Math.min(maxBatches, 100));
            return R.ok(yunkeCallRecordSyncService.syncFailedRecords(batches, 100, true));
        } catch (Exception e) {
            log.warn("云客通话记录同步失败 type={}", e.getClass().getSimpleName());
            return R.fail("云客通话记录同步失败，请稍后重试");
        }
    }

    /**
     * 总时长格式化:>=1小时 "Xh Ym",否则 "Ym Zs"。
     */
    private String formatDuration(long totalSeconds) {
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }
        return minutes + "m " + seconds + "s";
    }

    private long longVal(Object v) {
        if (v == null) return 0L;
        try { return Long.parseLong(String.valueOf(v)); } catch (Exception e) { return 0L; }
    }

    private double doubleVal(Object v) {
        if (v == null) return 0D;
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return 0D; }
    }

    private double rate(long numerator, long denominator) {
        if (denominator <= 0) return 0D;
        return Math.round(numerator * 1000.0 / denominator) / 10.0;
    }

    private TimeRange resolveRange(String range) {
        LocalDate today = LocalDate.now();
        String key = range == null ? "today" : range;
        return switch (key) {
            case "yesterday" -> new TimeRange(today.minusDays(1).atStartOfDay(), today.atStartOfDay());
            case "7d" -> new TimeRange(today.minusDays(6).atStartOfDay(), today.plusDays(1).atStartOfDay());
            case "30d" -> new TimeRange(today.minusDays(29).atStartOfDay(), today.plusDays(1).atStartOfDay());
            default -> new TimeRange(today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        };
    }

    private TimeRange resolvePreviousRange(String range, TimeRange current) {
        String key = range == null ? "today" : range;
        return switch (key) {
            case "yesterday" -> new TimeRange(current.start().minusDays(1), current.start());
            case "7d" -> new TimeRange(current.start().minusDays(7), current.start());
            case "30d" -> new TimeRange(current.start().minusDays(30), current.start());
            default -> new TimeRange(current.start().minusDays(1), current.start());
        };
    }

    private Map<String, Object> loadDashboardSummary(TimeRange range) {
        QueryWrapper<BizCallRecord> query = new QueryWrapper<BizCallRecord>()
                .select("COUNT(1) AS totalCalls",
                        "COALESCE(SUM(CASE WHEN connected = 1 THEN 1 ELSE 0 END), 0) AS connectedCount",
                        "COALESCE(SUM(CASE WHEN connected = 0 THEN 1 ELSE 0 END), 0) AS missedCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 AND duration >= 60 THEN 1 ELSE 0 END), 0) AS validCount",
                        "COALESCE(SUM(CASE WHEN record_url IS NOT NULL AND record_url <> '' THEN 1 ELSE 0 END), 0) AS recordCount",
                        "COALESCE(SUM(CASE WHEN intent_level IN ('A', '高') THEN 1 ELSE 0 END), 0) AS highIntentCount",
                        "COALESCE(SUM(duration), 0) AS totalDuration",
                        "MAX(call_time) AS latestCallTime")
                .eq("tenant_id", requireTenantId())
                .eq("call_type", "platform")
                .ge("call_time", range.start())
                .lt("call_time", range.end());
        applyCallScope(query);
        List<Map<String, Object>> rows = callRecordMapper.selectMaps(query);
        Map<String, Object> row = rows == null || rows.isEmpty() ? Map.of() : rows.get(0);
        long totalCalls = longVal(row.get("totalCalls"));
        long connectedCount = longVal(row.get("connectedCount"));
        long missedCount = longVal(row.get("missedCount"));
        long validCount = longVal(row.get("validCount"));
        long recordCount = longVal(row.get("recordCount"));
        long highIntentCount = longVal(row.get("highIntentCount"));
        long totalDuration = longVal(row.get("totalDuration"));
        long avgDuration = totalCalls > 0 ? Math.round(totalDuration * 1.0 / totalCalls) : 0L;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalCalls", totalCalls);
        data.put("connectedCount", connectedCount);
        data.put("missedCount", missedCount);
        data.put("failedCount", Math.max(totalCalls - connectedCount - missedCount, 0));
        data.put("validCount", validCount);
        data.put("recordCount", recordCount);
        data.put("highIntentCount", highIntentCount);
        data.put("connectRate", rate(connectedCount, totalCalls));
        data.put("validRate", rate(validCount, connectedCount));
        data.put("totalDuration", totalDuration);
        data.put("totalDurationText", formatDuration(totalDuration));
        data.put("avgDuration", avgDuration);
        data.put("avgDurationText", formatDuration(avgDuration));
        data.put("latestCallTime", row.get("latestCallTime"));
        return data;
    }

    private List<Map<String, Object>> loadDashboardAgents(TimeRange range) {
        QueryWrapper<BizCallRecord> query = new QueryWrapper<BizCallRecord>()
                .select("COALESCE(NULLIF(agent_name, ''), '未分配') AS agentName",
                        "COUNT(1) AS callCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 THEN 1 ELSE 0 END), 0) AS connectedCount",
                        "COALESCE(SUM(CASE WHEN connected = 0 THEN 1 ELSE 0 END), 0) AS missedCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 AND duration >= 60 THEN 1 ELSE 0 END), 0) AS validCount",
                        "COALESCE(SUM(CASE WHEN record_url IS NOT NULL AND record_url <> '' THEN 1 ELSE 0 END), 0) AS recordCount",
                        "COALESCE(SUM(duration), 0) AS totalDuration")
                .eq("tenant_id", requireTenantId())
                .eq("call_type", "platform")
                .ge("call_time", range.start())
                .lt("call_time", range.end())
                .groupBy("COALESCE(NULLIF(agent_name, ''), '未分配')")
                .orderByDesc("callCount");
        applyCallScope(query);
        query.last("LIMIT 20");
        List<Map<String, Object>> rows = callRecordMapper.selectMaps(query);
        List<Map<String, Object>> result = new ArrayList<>();
        if (rows == null) return result;
        int rank = 1;
        for (Map<String, Object> row : rows) {
            long callCount = longVal(row.get("callCount"));
            long connectedCount = longVal(row.get("connectedCount"));
            long totalDuration = longVal(row.get("totalDuration"));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("rank", rank++);
            item.put("agentName", row.get("agentName"));
            item.put("callCount", callCount);
            item.put("connectedCount", connectedCount);
            item.put("missedCount", longVal(row.get("missedCount")));
            item.put("validCount", longVal(row.get("validCount")));
            item.put("recordCount", longVal(row.get("recordCount")));
            item.put("connectRate", rate(connectedCount, callCount));
            item.put("totalDuration", totalDuration);
            item.put("totalDurationText", formatDuration(totalDuration));
            result.add(item);
        }
        return result;
    }

    private List<Map<String, Object>> loadDashboardTrend(String range, TimeRange timeRange) {
        boolean hourly = "today".equals(range) || "yesterday".equals(range);
        String bucketExpr = hourly ? "DATE_FORMAT(call_time, '%H:00')" : "DATE_FORMAT(call_time, '%m-%d')";
        QueryWrapper<BizCallRecord> query = new QueryWrapper<BizCallRecord>()
                .select(bucketExpr + " AS label",
                        "COUNT(1) AS callCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 THEN 1 ELSE 0 END), 0) AS connectedCount",
                        "COALESCE(SUM(CASE WHEN connected = 1 AND duration >= 60 THEN 1 ELSE 0 END), 0) AS validCount",
                        "COALESCE(SUM(duration), 0) AS totalDuration",
                        "MIN(call_time) AS firstCallTime")
                .eq("tenant_id", requireTenantId())
                .eq("call_type", "platform")
                .ge("call_time", timeRange.start())
                .lt("call_time", timeRange.end())
                .groupBy(bucketExpr)
                .orderByAsc("firstCallTime");
        applyCallScope(query);
        List<Map<String, Object>> rows = callRecordMapper.selectMaps(query);
        List<Map<String, Object>> result = new ArrayList<>();
        if (rows == null) return result;
        for (Map<String, Object> row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("label", row.get("label"));
            item.put("callCount", longVal(row.get("callCount")));
            item.put("connectedCount", longVal(row.get("connectedCount")));
            item.put("validCount", longVal(row.get("validCount")));
            item.put("totalDuration", longVal(row.get("totalDuration")));
            result.add(item);
        }
        return result;
    }

    /**
     * 无 dept_id 的话单按坐席过滤。兼容历史数据仅存 agent_name 的情况:
     * 同时匹配系统姓名和云客账号映射,避免收紧权限后本人历史统计归零。
     */
    private void applyCallScope(LambdaQueryWrapper<BizCallRecord> wrapper, boolean requestedAll) {
        List<Long> visibleIds = requestedAll
                ? dataScopeHelper.getVisibleUserIds()
                : java.util.Collections.singletonList(SecurityUtils.getCurrentUserId());
        if (visibleIds == null) {
            return;
        }
        List<String> tokens = visibleAgentTokens(visibleIds);
        wrapper.and(w -> {
            w.in(BizCallRecord::getAgentId, visibleIds);
            if (!tokens.isEmpty()) {
                w.or(old -> old.isNull(BizCallRecord::getAgentId)
                        .in(BizCallRecord::getAgentName, tokens));
            }
        });
    }

    private void applyCallScope(QueryWrapper<BizCallRecord> wrapper) {
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        if (visibleIds == null) {
            return;
        }
        List<String> tokens = visibleAgentTokens(visibleIds);
        wrapper.and(w -> {
            w.in("agent_id", visibleIds);
            if (!tokens.isEmpty()) {
                w.or(old -> old.isNull("agent_id").in("agent_name", tokens));
            }
        });
    }

    private List<BizCallRecord> markRecordingAvailability(List<BizCallRecord> records) {
        if (records != null) {
            records.forEach(record -> record.setRecordingAvailable(StringUtils.hasText(record.getRecordUrl())));
        }
        return records;
    }

    private List<String> visibleAgentTokens(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        Set<String> tokens = new HashSet<>();
        dataScopeHelper.resolveUserNames(userIds).values().stream()
                .filter(StringUtils::hasText).forEach(tokens::add);
        List<BizYunkeUserMap> maps = yunkeUserMapMapper.selectList(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, requireTenantId())
                .in(BizYunkeUserMap::getUserId, userIds));
        for (BizYunkeUserMap map : maps) {
            addToken(tokens, map.getUserName());
            addToken(tokens, map.getUserPhone());
            addToken(tokens, map.getYunkeUserId());
            addToken(tokens, map.getYunkePhone());
            addToken(tokens, map.getYunkeNickname());
        }
        if (userIds.size() == 1 && userIds.contains(SecurityUtils.getCurrentUserId())) {
            addToken(tokens, SecurityUtils.getCurrentUsername());
        }
        return tokens.stream().sorted().collect(Collectors.toList());
    }

    private void addToken(Set<String> tokens, String value) {
        if (StringUtils.hasText(value)) {
            tokens.add(value.trim());
        }
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文,请重新登录");
        }
        return tenantId;
    }

    private record TimeRange(LocalDateTime start, LocalDateTime end) {}
}
