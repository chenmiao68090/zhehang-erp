package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.dto.SalesConsoleQuery;
import com.zhehang.erp.modules.crm.domain.vo.SalesConsoleVO;
import com.zhehang.erp.modules.crm.domain.vo.SalesStageCustomerVO;
import com.zhehang.erp.modules.crm.mapper.SalesOperatingConsoleMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.crm.support.SalesConsoleQueryContext;
import com.zhehang.erp.modules.crm.support.SalesStage;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesOperatingConsoleService {

    private static final int MAX_RANGE_DAYS = 366;
    private static final List<SalesStage> FUNNEL_STAGES = List.of(
            SalesStage.LEAD_RECEIVED,
            SalesStage.NEEDS_COMMUNICATION,
            SalesStage.NEEDS_CLARIFICATION,
            SalesStage.SIGNING_PAYMENT,
            SalesStage.HANDOFF_DELIVERY);

    private final SalesOperatingConsoleMapper mapper;
    private final DataScopeHelper dataScopeHelper;

    @Transactional(readOnly = true)
    public SalesConsoleVO overview(SalesConsoleQuery query) {
        SalesConsoleQueryContext context = buildContext(query);
        Map<String, Object> lead = emptyIfNull(mapper.selectLeadSummary(context));
        Map<String, Object> orders = emptyIfNull(mapper.selectOrderSummary(context));
        Map<String, Object> renewal = emptyIfNull(mapper.selectRenewalSummary(context));

        SalesConsoleVO result = new SalesConsoleVO();
        applyScope(result, context);
        applyMetrics(result, lead, orders);
        applyTaskSummary(result, lead);
        applyRenewal(result, renewal);

        LocalDateTime firstEvent = mapper.selectFirstStageEventTime(context);
        result.setDataSince(firstEvent);
        result.setHistoryAvailable(firstEvent != null);
        result.setNewBusinessFunnel(buildFunnel(
                mapper.selectStageSnapshot(context),
                mapper.selectStageEventFlows(context),
                firstEvent != null));
        result.setActions(mapActions(mapper.selectActionRows(context, 12)));
        result.setExceptions(buildExceptions(result));
        result.setBossActions(buildBossActions(result));
        result.setTeam(buildTeam(
                mapper.selectOwnerLeadStats(context),
                mapper.selectOwnerOrderStats(context)));
        result.setFilters(buildFilters(context));
        return result;
    }

    @Transactional(readOnly = true)
    public IPage<SalesStageCustomerVO> stageCustomers(String stageCode,
                                                      SalesConsoleQuery query,
                                                      int pageNum,
                                                      int pageSize) {
        SalesStage stage = SalesStage.fromCode(stageCode);
        if (stage == null || !stage.isFunnelStage()) {
            throw new BusinessException("销售阶段不存在");
        }
        SalesConsoleQueryContext context = buildContext(query);
        int safePage = Math.max(pageNum, 1);
        int safeSize = Math.min(Math.max(pageSize, 1), 100);
        String keyword = query == null || !StringUtils.hasText(query.getKeyword())
                ? null : query.getKeyword().trim();
        return mapper.selectStageCustomers(
                new Page<>(safePage, safeSize), context, stage.name(), keyword);
    }

    /** 仅供主管/老板AI复盘使用的脱敏聚合事实，不返回客户、手机号或原始备注。 */
    @Transactional(readOnly = true)
    public Map<String, Object> aiAggregateFacts(SalesConsoleQuery query) {
        SalesConsoleQueryContext context = buildContext(query);
        Map<String, Object> facts = new LinkedHashMap<>();
        facts.put("sourceQuality", mapper.selectSourceQuality(context, 12));
        facts.put("lossReasons", mapper.selectLossReasons(context, 10));
        return facts;
    }

    private SalesConsoleQueryContext buildContext(SalesConsoleQuery query) {
        SalesConsoleQuery safe = query == null ? new SalesConsoleQuery() : query;
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        if (tenantId == null || userId == null) {
            throw new BusinessException("登录状态已失效，请重新登录");
        }

        LocalDate today = LocalDate.now();
        LocalDate start = safe.getStartDate() == null ? today.withDayOfMonth(1) : safe.getStartDate();
        LocalDate end = safe.getEndDate() == null ? today : safe.getEndDate();
        if (end.isBefore(start)) {
            throw new BusinessException("结束日期不能早于开始日期");
        }
        if (start.plusDays(MAX_RANGE_DAYS - 1L).isBefore(end)) {
            throw new BusinessException("单次查询最长支持366天");
        }
        if (end.isAfter(today)) {
            throw new BusinessException("结束日期不能晚于今天");
        }

        Integer dataScope = SecurityUtils.getCurrentDataScope();
        Long currentDeptId = SecurityUtils.getCurrentDeptId();
        boolean companyScope = SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("boss", "super_admin")
                || Integer.valueOf(1).equals(dataScope);
        String scopeMode;
        List<Long> deptIds = List.of();
        if (companyScope) {
            scopeMode = "COMPANY";
        } else if (currentDeptId != null && (Integer.valueOf(3).equals(dataScope)
                || Integer.valueOf(4).equals(dataScope))) {
            scopeMode = "DEPARTMENT";
            deptIds = Integer.valueOf(4).equals(dataScope)
                    ? dataScopeHelper.deptSelfAndChildren(currentDeptId)
                    : List.of(currentDeptId);
        } else {
            scopeMode = "SELF";
        }

        Long ownerId = safe.getOwnerId();
        Long deptId = safe.getDeptId();
        if ("SELF".equals(scopeMode)) {
            if (ownerId != null && !ownerId.equals(userId)) {
                throw new AccessDeniedException("员工只能查看自己的销售数据");
            }
            if (deptId != null && !deptId.equals(currentDeptId)) {
                throw new AccessDeniedException("员工不能切换到其他部门");
            }
            ownerId = userId;
            deptId = null;
        } else if ("DEPARTMENT".equals(scopeMode)) {
            if (deptId != null && !deptIds.contains(deptId)) {
                throw new AccessDeniedException("该部门不在你的数据范围内");
            }
            if (ownerId != null && !dataScopeHelper.canAccessOwner(ownerId)) {
                throw new AccessDeniedException("该员工不在你的数据范围内");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        return SalesConsoleQueryContext.builder()
                .tenantId(tenantId)
                .userId(userId)
                .currentDeptId(currentDeptId)
                .scopeMode(scopeMode)
                .deptIds(deptIds)
                .ownerId(ownerId)
                .deptId(deptId)
                .startDate(start)
                .endDate(end)
                .startTime(start.atStartOfDay())
                .endTimeExclusive(end.plusDays(1).atStartOfDay())
                .now(now)
                .todayStart(today.atStartOfDay())
                .tomorrowStart(today.plusDays(1).atStartOfDay())
                .dueSoonDate(today.plusDays(30))
                .build();
    }

    private void applyScope(SalesConsoleVO result, SalesConsoleQueryContext context) {
        result.setViewMode(switch (context.getScopeMode()) {
            case "COMPANY" -> "boss";
            case "DEPARTMENT" -> "manager";
            default -> "employee";
        });
        result.getScope().setMode(context.getScopeMode());
        result.getScope().setLabel(switch (context.getScopeMode()) {
            case "COMPANY" -> "全公司";
            case "DEPARTMENT" -> "本部门";
            default -> "仅本人";
        });
        result.getScope().setOwnerId(context.getOwnerId());
        result.getScope().setDeptId(context.getDeptId());
        result.getRange().setStartDate(context.getStartDate());
        result.getRange().setEndDate(context.getEndDate());
    }

    private void applyMetrics(SalesConsoleVO result,
                              Map<String, Object> lead,
                              Map<String, Object> orders) {
        SalesConsoleVO.Metrics metrics = result.getMetrics();
        metrics.setConfirmedAmount(decimal(orders, "confirmedAmount"));
        metrics.setConfirmedOrderCount(number(orders, "confirmedOrderCount"));
        metrics.setNewBusinessAmount(decimal(orders, "newBusinessAmount"));
        metrics.setNewBusinessCount(number(orders, "newBusinessCount"));
        metrics.setRenewalAmount(decimal(orders, "renewalAmount"));
        metrics.setRenewalCount(number(orders, "renewalCount"));
        metrics.setWeightedForecastAmount(decimal(lead, "weightedForecastAmount"));
        long active = number(lead, "activeLeadCount");
        long valid = number(lead, "forecastValidCount");
        metrics.setForecastDataCompleteness(active == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(valid * 100L)
                .divide(BigDecimal.valueOf(active), 1, RoundingMode.HALF_UP));
        metrics.setTargetConfigured(false);
    }

    private void applyTaskSummary(SalesConsoleVO result, Map<String, Object> lead) {
        SalesConsoleVO.TaskSummary summary = result.getTaskSummary();
        summary.setActiveLeadCount(number(lead, "activeLeadCount"));
        summary.setTodayActionCount(number(lead, "todayActionCount"));
        summary.setOverdueCount(number(lead, "overdueCount"));
        summary.setNoNextActionCount(number(lead, "noNextActionCount"));
        summary.setHighIntentCount(number(lead, "highIntentCount"));
    }

    private void applyRenewal(SalesConsoleVO result, Map<String, Object> row) {
        SalesConsoleVO.RenewalSummary renewal = result.getRenewalSummary();
        renewal.setOutstandingCount(number(row, "outstandingCount"));
        renewal.setOutstandingAmount(decimal(row, "outstandingAmount"));
        renewal.setDueSoonCount(number(row, "dueSoonCount"));
        renewal.setDueSoonAmount(decimal(row, "dueSoonAmount"));
        renewal.setOverdueCount(number(row, "overdueCount"));
        renewal.setOverdueAmount(decimal(row, "overdueAmount"));
        renewal.setPromisedCount(number(row, "promisedCount"));
        renewal.setPromisedAmount(decimal(row, "promisedAmount"));
        renewal.setBadRiskCount(number(row, "badRiskCount"));
        renewal.setBadRiskAmount(decimal(row, "badRiskAmount"));
    }

    private List<SalesConsoleVO.StageItem> buildFunnel(List<Map<String, Object>> snapshotRows,
                                                        List<Map<String, Object>> flowRows,
                                                        boolean historyAvailable) {
        Map<SalesStage, SalesConsoleVO.StageItem> items = new EnumMap<>(SalesStage.class);
        for (SalesStage stage : FUNNEL_STAGES) {
            SalesConsoleVO.StageItem item = new SalesConsoleVO.StageItem();
            item.setCode(stage.name());
            item.setLabel(stage.getLabel());
            item.setOrder(stage.getOrder());
            items.put(stage, item);
        }
        for (Map<String, Object> row : safeRows(snapshotRows)) {
            SalesStage stage = SalesStage.fromCode(text(row, "stageCode"));
            SalesConsoleVO.StageItem item = items.get(stage);
            if (item != null) {
                item.setCurrentCount(number(row, "currentCount"));
                item.setOverdueCount(number(row, "overdueCount"));
            }
        }
        for (Map<String, Object> row : safeRows(flowRows)) {
            SalesStage from = SalesStage.fromCode(text(row, "fromStageCode"));
            SalesStage to = SalesStage.fromCode(text(row, "toStageCode"));
            long count = number(row, "eventCount");
            if (to != null && items.containsKey(to)) {
                items.get(to).setEnteredCount(items.get(to).getEnteredCount() + count);
            }
            if (from != null && to != null && items.containsKey(from)
                    && to.isFunnelStage() && to.getOrder() > from.getOrder()) {
                items.get(from).setAdvancedCount(items.get(from).getAdvancedCount() + count);
            }
        }
        for (SalesConsoleVO.StageItem item : items.values()) {
            if (!historyAvailable || item.getEnteredCount() == 0) {
                item.setConversionRate(null);
            } else {
                item.setConversionRate(BigDecimal.valueOf(item.getAdvancedCount() * 100L)
                        .divide(BigDecimal.valueOf(item.getEnteredCount()), 1, RoundingMode.HALF_UP));
            }
        }
        return FUNNEL_STAGES.stream().map(items::get).toList();
    }

    private List<SalesConsoleVO.ActionItem> mapActions(List<Map<String, Object>> rows) {
        List<SalesConsoleVO.ActionItem> result = new ArrayList<>();
        for (Map<String, Object> row : safeRows(rows)) {
            SalesConsoleVO.ActionItem item = new SalesConsoleVO.ActionItem();
            item.setLeadId(id(row, "leadId"));
            item.setCompanyName(text(row, "companyName"));
            item.setOwnerId(id(row, "ownerId"));
            item.setOwnerName(text(row, "ownerName"));
            item.setDeptId(id(row, "deptId"));
            item.setDeptName(text(row, "deptName"));
            item.setStageCode(text(row, "stageCode"));
            SalesStage stage = SalesStage.fromCode(item.getStageCode());
            item.setStageName(stage == null ? "未分阶段" : stage.getLabel());
            item.setNextActionType(text(row, "nextActionType"));
            item.setNextActionTime(dateTime(row, "nextActionTime"));
            item.setLastFollowTime(dateTime(row, "lastFollowTime"));
            item.setExpectedAmount(decimal(row, "expectedAmount"));
            item.setActionType(text(row, "actionType"));
            item.setSeverity(text(row, "severity"));
            item.setAgeDays(number(row, "ageDays"));
            item.setCustomerLevel(text(row, "customerLevel"));
            result.add(item);
        }
        return result;
    }

    private List<SalesConsoleVO.ExceptionItem> buildExceptions(SalesConsoleVO result) {
        List<SalesConsoleVO.ExceptionItem> rows = new ArrayList<>();
        addException(rows, "LEAD_OVERDUE", "跟进已逾期", "danger",
                result.getTaskSummary().getOverdueCount(), null);
        addException(rows, "NO_NEXT_ACTION", "未安排下一步", "warning",
                result.getTaskSummary().getNoNextActionCount(), null);
        addException(rows, "RENEWAL_OVERDUE", "续费已逾期", "danger",
                result.getRenewalSummary().getOverdueCount(), result.getRenewalSummary().getOverdueAmount());
        addException(rows, "BAD_DEBT_RISK", "坏账风险", "danger",
                result.getRenewalSummary().getBadRiskCount(), result.getRenewalSummary().getBadRiskAmount());
        return rows;
    }

    private void addException(List<SalesConsoleVO.ExceptionItem> rows,
                              String type, String label, String severity, long count, BigDecimal amount) {
        if (count <= 0) {
            return;
        }
        SalesConsoleVO.ExceptionItem row = new SalesConsoleVO.ExceptionItem();
        row.setType(type);
        row.setLabel(label);
        row.setSeverity(severity);
        row.setCount(count);
        row.setAmount(amount);
        rows.add(row);
    }

    private List<SalesConsoleVO.BossAction> buildBossActions(SalesConsoleVO result) {
        List<SalesConsoleVO.BossAction> rows = new ArrayList<>();
        addBossAction(rows, "RENEWAL_OVERDUE", "先处理逾期续费",
                "已有应收超过到期日，优先明确责任人和承诺付款时间。", "danger",
                result.getRenewalSummary().getOverdueCount(), result.getRenewalSummary().getOverdueAmount());
        addBossAction(rows, "LEAD_EXECUTION", "盯住销售执行缺口",
                "逾期跟进和未安排下一步会直接造成线索流失。", "warning",
                result.getTaskSummary().getOverdueCount() + result.getTaskSummary().getNoNextActionCount(), null);
        BigDecimal completeness = result.getMetrics().getForecastDataCompleteness();
        if (completeness.compareTo(new BigDecimal("80")) < 0) {
            addBossAction(rows, "FORECAST_QUALITY", "补齐成交预测数据",
                    "预计金额和成交概率完整度低于80%，暂不适合用来做可靠预测。", "primary",
                    result.getTaskSummary().getActiveLeadCount(), null);
        }
        if (rows.isEmpty()) {
            addBossAction(rows, "STABLE", "经营节奏正常",
                    "当前未发现逾期回款或销售执行异常，继续保持每日复盘。", "success", 0, null);
        }
        return rows.stream().limit(3).toList();
    }

    private void addBossAction(List<SalesConsoleVO.BossAction> rows,
                               String type, String title, String reason, String severity,
                               long count, BigDecimal amount) {
        if (count <= 0 && !"STABLE".equals(type)) {
            return;
        }
        SalesConsoleVO.BossAction row = new SalesConsoleVO.BossAction();
        row.setType(type);
        row.setTitle(title);
        row.setReason(reason);
        row.setSeverity(severity);
        row.setCount(count);
        row.setAmount(amount);
        rows.add(row);
    }

    private List<SalesConsoleVO.TeamMember> buildTeam(List<Map<String, Object>> leadRows,
                                                       List<Map<String, Object>> orderRows) {
        Map<Long, SalesConsoleVO.TeamMember> team = new LinkedHashMap<>();
        for (Map<String, Object> row : safeRows(leadRows)) {
            Long ownerId = id(row, "ownerId");
            if (ownerId == null) continue;
            SalesConsoleVO.TeamMember member = member(team, ownerId, row);
            member.setActiveLeadCount(number(row, "activeLeadCount"));
            member.setOverdueCount(number(row, "overdueCount"));
            member.setNoNextActionCount(number(row, "noNextActionCount"));
        }
        for (Map<String, Object> row : safeRows(orderRows)) {
            Long ownerId = id(row, "ownerId");
            if (ownerId == null) continue;
            SalesConsoleVO.TeamMember member = member(team, ownerId, row);
            member.setConfirmedAmount(decimal(row, "confirmedAmount"));
            member.setConfirmedOrderCount(number(row, "confirmedOrderCount"));
        }
        return team.values().stream()
                .sorted(Comparator.comparingLong(SalesConsoleVO.TeamMember::getOverdueCount).reversed()
                        .thenComparing(SalesConsoleVO.TeamMember::getConfirmedAmount, Comparator.reverseOrder()))
                .toList();
    }

    private SalesConsoleVO.TeamMember member(Map<Long, SalesConsoleVO.TeamMember> team,
                                              Long ownerId,
                                              Map<String, Object> row) {
        SalesConsoleVO.TeamMember member = team.computeIfAbsent(ownerId, key -> {
            SalesConsoleVO.TeamMember created = new SalesConsoleVO.TeamMember();
            created.setOwnerId(key);
            return created;
        });
        if (!StringUtils.hasText(member.getOwnerName())) member.setOwnerName(text(row, "ownerName"));
        if (member.getDeptId() == null) member.setDeptId(id(row, "deptId"));
        if (!StringUtils.hasText(member.getDeptName())) member.setDeptName(text(row, "deptName"));
        return member;
    }

    private SalesConsoleVO.FilterOptions buildFilters(SalesConsoleQueryContext context) {
        SalesConsoleVO.FilterOptions filters = new SalesConsoleVO.FilterOptions();
        for (Map<String, Object> row : safeRows(mapper.selectOwnerOptions(context))) {
            SalesConsoleVO.OwnerOption option = new SalesConsoleVO.OwnerOption();
            option.setId(id(row, "id"));
            option.setName(text(row, "name"));
            option.setDeptId(id(row, "deptId"));
            option.setDeptName(text(row, "deptName"));
            filters.getOwners().add(option);
        }
        for (Map<String, Object> row : safeRows(mapper.selectDepartmentOptions(context))) {
            SalesConsoleVO.DepartmentOption option = new SalesConsoleVO.DepartmentOption();
            option.setId(id(row, "id"));
            option.setName(text(row, "name"));
            filters.getDepartments().add(option);
        }
        return filters;
    }

    private Map<String, Object> emptyIfNull(Map<String, Object> row) {
        return row == null ? Map.of() : row;
    }

    private List<Map<String, Object>> safeRows(List<Map<String, Object>> rows) {
        return rows == null ? List.of() : rows;
    }

    private long number(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof Number number) return number.longValue();
        if (value == null) return 0;
        try {
            return new BigDecimal(String.valueOf(value)).longValue();
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private Long id(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof Number number) return number.longValue();
        if (value == null) return null;
        try {
            return Long.valueOf(String.valueOf(value));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private BigDecimal decimal(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof BigDecimal decimal) return decimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        if (value == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ignored) {
            return BigDecimal.ZERO;
        }
    }

    private String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private LocalDateTime dateTime(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value instanceof LocalDateTime dateTime) return dateTime;
        if (value instanceof Timestamp timestamp) return timestamp.toLocalDateTime();
        if (value == null) return null;
        try {
            return LocalDateTime.parse(String.valueOf(value).replace(' ', 'T'));
        } catch (Exception ignored) {
            return null;
        }
    }
}
