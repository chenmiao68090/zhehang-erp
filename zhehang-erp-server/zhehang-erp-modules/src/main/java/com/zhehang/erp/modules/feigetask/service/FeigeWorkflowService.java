package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeWorkflowReport;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeWorkflowRequired;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeWorkflowTask;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeWorkflowTemplate;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowReportMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowRequiredMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowTemplateMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeigeWorkflowService {

    private static final Set<String> CYCLES = Set.of("day", "week", "month");

    private final FeigeWorkflowTemplateMapper templateMapper;
    private final FeigeWorkflowTaskMapper taskMapper;
    private final FeigeWorkflowReportMapper reportMapper;
    private final FeigeWorkflowRequiredMapper requiredMapper;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final FeigeTaskAccessService access;
    private final ObjectMapper objectMapper;

    public Map<String, Object> templates(int pageNum, int pageSize, String cycleType,
                                         Long roleId, Boolean enabled, String keyword) {
        validateCycleOptional(cycleType);
        LambdaQueryWrapper<FeigeWorkflowTemplate> query = new LambdaQueryWrapper<>();
        query.eq(StringUtils.hasText(cycleType), FeigeWorkflowTemplate::getCycleType, cycleType)
                .eq(roleId != null, FeigeWorkflowTemplate::getRoleId, roleId)
                .eq(enabled != null, FeigeWorkflowTemplate::getEnabled, Boolean.TRUE.equals(enabled) ? 1 : 0);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeWorkflowTemplate::getTaskName, keyword)
                    .or().like(FeigeWorkflowTemplate::getRoleName, keyword));
        }
        query.orderByAsc(FeigeWorkflowTemplate::getSortNo)
                .orderByAsc(FeigeWorkflowTemplate::getId);
        IPage<FeigeWorkflowTemplate> page = templateMapper.selectPage(
                new Page<>(safePage(pageNum), safeSize(pageSize)), query);
        return pageResult(page, page.getRecords().stream().map(this::templateView).toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createTemplate(FeigeTaskRequests.WorkflowTemplateUpsert request) {
        access.requireManager();
        validateTemplate(request);
        FeigeWorkflowTemplate row = new FeigeWorkflowTemplate();
        copyTemplate(row, request);
        if (templateMapper.insert(row) <= 0) {
            throw new BusinessException("工作计划模板创建失败");
        }
        access.log("workflow_template", row.getId(), "create", null,
                row.getEnabled().toString(), "创建工作计划模板", null);
        return row.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateTemplate(Long id, FeigeTaskRequests.WorkflowTemplateUpsert request) {
        access.requireManager();
        validateTemplate(request);
        FeigeWorkflowTemplate row = requireTemplate(id);
        String from = row.getEnabled().toString();
        copyTemplate(row, request);
        updateTemplateOrConflict(row);
        access.log("workflow_template", id, "update", from,
                row.getEnabled().toString(), "更新工作计划模板", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteTemplate(Long id) {
        access.requireManager();
        FeigeWorkflowTemplate row = requireTemplate(id);
        if (templateMapper.deleteById(row.getId()) <= 0) {
            throw new BusinessException(409, "模板已被其他人删除，请刷新后重试");
        }
        access.log("workflow_template", id, "delete", row.getEnabled().toString(), null,
                "删除工作计划模板", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> tasks(Long requestedUserId, String cycleType, String periodKey,
                                     int pageNum, int pageSize) {
        validatePeriod(cycleType, periodKey);
        Long userId = requestedUserId == null ? access.currentUserId() : requestedUserId;
        requireTaskViewer(userId);
        boolean exempt = !isRequired(userId);
        if (!exempt) {
            materializeTemplates(userId, cycleType, periodKey);
        }
        LambdaQueryWrapper<FeigeWorkflowTask> query = new LambdaQueryWrapper<FeigeWorkflowTask>()
                .eq(FeigeWorkflowTask::getUserId, userId)
                .eq(FeigeWorkflowTask::getCycleType, cycleType)
                .eq(FeigeWorkflowTask::getPeriodKey, periodKey)
                .orderByAsc(FeigeWorkflowTask::getId);
        IPage<FeigeWorkflowTask> page = taskMapper.selectPage(
                new Page<>(safePage(pageNum), safeSize(pageSize)), query);
        Map<String, Object> result = pageResult(page,
                page.getRecords().stream().map(this::taskView).toList());
        FeigeWorkflowReport report = report(userId, cycleType, periodKey);
        result.put("summary", report == null ? null : report.getSummary());
        result.put("isExempt", exempt);
        return result;
    }

    public List<Map<String, Object>> monthStats(String month) {
        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.parse(month);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new BusinessException("月份格式应为 YYYY-MM");
        }
        Long userId = access.currentUserId();
        List<FeigeWorkflowTask> rows = taskMapper.selectList(new LambdaQueryWrapper<FeigeWorkflowTask>()
                .eq(FeigeWorkflowTask::getUserId, userId)
                .eq(FeigeWorkflowTask::getCycleType, "day")
                .likeRight(FeigeWorkflowTask::getPeriodKey, month));
        Map<String, List<FeigeWorkflowTask>> byDate = new LinkedHashMap<>();
        rows.forEach(row -> byDate.computeIfAbsent(row.getPeriodKey(), ignored -> new ArrayList<>()).add(row));
        List<Map<String, Object>> result = new ArrayList<>();
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            String date = yearMonth.atDay(day).toString();
            List<FeigeWorkflowTask> dayRows = byDate.getOrDefault(date, List.of());
            long done = dayRows.stream().filter(row -> Integer.valueOf(1).equals(row.getDone())).count();
            Map<String, Object> stat = new LinkedHashMap<>();
            stat.put("date", date);
            stat.put("total", dayRows.size());
            stat.put("done", done);
            stat.put("rate", percent(done, dayRows.size()).intValue());
            stat.put("submitted", report(userId, "day", date) != null);
            result.add(stat);
        }
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void action(Long id, String actionName, FeigeTaskRequests.WorkflowTaskDetail detail,
                       FeigeTaskRequests.WorkflowUndone undone) {
        FeigeWorkflowTask row = requireOwnedTask(id);
        String from = workflowStatus(row);
        switch (actionName) {
            case "done" -> {
                if (!Set.of("pending", "undone").contains(from)) {
                    throw new BusinessException(409, "当前状态不能标记完成");
                }
                if (detail != null && detail.getMetrics() != null) {
                    List<Map<String, Object>> normalized = validateMetricValues(
                            row.getDetailFieldsJson(), writeJson(detail.getMetrics()), true);
                    row.setWorkDetailJson(writeJson(normalized));
                }
                validateMetricValues(row.getDetailFieldsJson(), row.getWorkDetailJson(), true);
                row.setDone(1);
                row.setDoneTime(java.time.LocalDateTime.now());
                row.setUndoneReason(null);
            }
            case "undo" -> {
                if (!Set.of("done", "undone").contains(from)) {
                    throw new BusinessException(409, "当前状态不能撤销");
                }
                row.setDone(0);
                row.setDoneTime(null);
                row.setUndoneReason(null);
            }
            case "undone" -> {
                if (undone == null || !StringUtils.hasText(undone.getReason())) {
                    throw new BusinessException("未完成原因不能为空");
                }
                if (!Set.of("pending", "done").contains(from)) {
                    throw new BusinessException(409, "当前状态不能标记未完成");
                }
                row.setDone(0);
                row.setDoneTime(null);
                row.setUndoneReason(undone.getReason());
            }
            case "detail" -> {
                if (detail == null || detail.getMetrics() == null) {
                    throw new BusinessException("任务明细不能为空");
                }
                List<Map<String, Object>> normalized = validateMetricValues(
                        row.getDetailFieldsJson(), writeJson(detail.getMetrics()), true);
                row.setWorkDetailJson(writeJson(normalized));
            }
            case "remark" -> row.setRemark(detail == null ? null : detail.getRemark());
            default -> throw new BusinessException("未知的工作计划操作");
        }
        updateTaskOrConflict(row);
        access.log("workflow_task", id, actionName, from, workflowStatus(row),
                "更新工作计划任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveSummary(FeigeTaskRequests.WorkflowSummary request) {
        validatePeriod(request.getCycleType(), request.getPeriodKey());
        Long userId = access.currentUserId();
        List<FeigeWorkflowTask> rows = taskRows(userId, request.getCycleType(), request.getPeriodKey());
        int done = (int) rows.stream().filter(row -> Integer.valueOf(1).equals(row.getDone())).count();
        List<Map<String, Object>> undone = rows.stream()
                .filter(row -> StringUtils.hasText(row.getUndoneReason()))
                .map(row -> Map.<String, Object>of("taskId", row.getId(),
                        "taskName", row.getTaskName(), "reason", row.getUndoneReason()))
                .toList();
        FeigeWorkflowReport report = report(userId, request.getCycleType(), request.getPeriodKey());
        if (report == null) {
            report = new FeigeWorkflowReport();
            report.setUserId(userId);
            report.setUserName(access.currentUserName());
            report.setDeptId(access.currentUser().getDeptId());
            report.setCycleType(request.getCycleType());
            report.setPeriodKey(request.getPeriodKey());
        }
        report.setTotalCount(rows.size());
        report.setDoneCount(done);
        report.setCompletionRate(percent(done, rows.size()));
        report.setSummary(request.getSummary());
        report.setUndoneDetailsJson(writeJson(undone));
        report.setSubmittedAt(java.time.LocalDateTime.now());
        if (report.getId() == null) {
            try {
                if (reportMapper.insert(report) <= 0) {
                    throw new BusinessException(409, "工作总结保存冲突，请刷新后重试");
                }
            } catch (DuplicateKeyException duplicate) {
                report = reportForUpdate(userId, request.getCycleType(), request.getPeriodKey());
                if (report == null) {
                    throw new BusinessException(409, "工作总结保存冲突，请刷新后重试");
                }
                report.setTotalCount(rows.size());
                report.setDoneCount(done);
                report.setCompletionRate(percent(done, rows.size()));
                report.setSummary(request.getSummary());
                report.setUndoneDetailsJson(writeJson(undone));
                report.setSubmittedAt(java.time.LocalDateTime.now());
                if (reportMapper.updateById(report) <= 0) {
                    throw new BusinessException(409, "工作总结保存冲突，请刷新后重试");
                }
            }
        } else if (reportMapper.updateById(report) <= 0) {
            throw new BusinessException(409, "工作总结保存冲突，请刷新后重试");
        }
        access.log("workflow_report", report.getId(), "submit", null, "submitted",
                "提交工作总结", null);
    }

    public List<Map<String, Object>> reportRows(String cycleType, String periodKey,
                                                Long roleId, String keyword) {
        access.requireManager();
        validateCycleOptional(cycleType);
        List<SysUser> users = visibleUsers(roleId, keyword).stream()
                .filter(user -> isRequired(user.getId()))
                .toList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (SysUser user : users) {
            result.add(reportRow(user, cycleType, periodKey));
        }
        return result;
    }

    public List<Map<String, Object>> requiredScopes() {
        access.requireManager();
        return requiredMapper.selectList(new LambdaQueryWrapper<FeigeWorkflowRequired>()
                        .orderByAsc(FeigeWorkflowRequired::getTargetType)
                        .orderByAsc(FeigeWorkflowRequired::getTargetName))
                .stream().map(row -> {
                    Map<String, Object> view = new LinkedHashMap<>();
                    view.put("id", row.getId());
                    view.put("scopeType", row.getTargetType());
                    view.put("targetId", row.getTargetId());
                    view.put("targetName", row.getTargetName());
                    view.put("enabled", Integer.valueOf(1).equals(row.getActive()));
                    return view;
                }).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public Long saveRequired(FeigeTaskRequests.WorkflowRequiredUpsert request) {
        access.requireManager();
        String type = StringUtils.hasText(request.getScopeType())
                ? request.getScopeType() : request.getTargetType();
        if (!Set.of("user", "role").contains(type)) {
            throw new BusinessException("必报范围仅支持 user/role");
        }
        String name;
        if ("user".equals(type)) {
            SysUser user = access.requireVisibleActiveUser(request.getTargetId());
            name = access.displayName(user);
        } else {
            SysRole role = access.requireActiveRole(request.getTargetId());
            name = role.getRoleName();
        }
        FeigeWorkflowRequired row = requiredMapper.selectOne(new LambdaQueryWrapper<FeigeWorkflowRequired>()
                .eq(FeigeWorkflowRequired::getTargetType, type)
                .eq(FeigeWorkflowRequired::getTargetId, request.getTargetId())
                .last("LIMIT 1"));
        if (row == null) {
            row = new FeigeWorkflowRequired();
            row.setTargetType(type);
            row.setTargetId(request.getTargetId());
        }
        row.setTargetName(name);
        row.setRemark(request.getRemark());
        row.setActive(request.getEnabled() == null
                ? (Integer.valueOf(0).equals(request.getActive()) ? 0 : 1)
                : (request.getEnabled() ? 1 : 0));
        if (row.getId() == null ? requiredMapper.insert(row) <= 0 : requiredMapper.updateById(row) <= 0) {
            throw new BusinessException(409, "必报范围保存冲突，请刷新后重试");
        }
        access.log("workflow_required", row.getId(), "save", null,
                row.getActive().toString(), "保存工作计划必报范围", null);
        return row.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteRequired(Long id) {
        access.requireManager();
        FeigeWorkflowRequired row = requiredMapper.selectById(id);
        if (row == null) {
            throw new BusinessException("必报范围不存在或不属于当前租户");
        }
        if (requiredMapper.deleteById(id) <= 0) {
            throw new BusinessException(409, "必报范围已被删除，请刷新后重试");
        }
        access.log("workflow_required", id, "delete", row.getActive().toString(), null,
                "删除工作计划必报范围", null);
    }

    public Map<String, Object> subordinates(String cycleType, String periodKey, Long roleId,
                                             String keyword, int pageNum, int pageSize) {
        access.requireManager();
        validatePeriod(cycleType, periodKey);
        List<Map<String, Object>> rows = visibleUsers(roleId, keyword).stream()
                .filter(user -> !Objects.equals(user.getId(), access.currentUserId()))
                .map(user -> subordinateRow(user, cycleType, periodKey))
                .toList();
        int from = Math.min((safePage(pageNum) - 1) * safeSize(pageSize), rows.size());
        int to = Math.min(from + safeSize(pageSize), rows.size());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", rows.subList(from, to));
        result.put("total", rows.size());
        result.put("current", safePage(pageNum));
        result.put("size", safeSize(pageSize));
        result.put("pages", rows.isEmpty() ? 0 : (rows.size() + safeSize(pageSize) - 1) / safeSize(pageSize));
        return result;
    }

    public Map<String, Object> subordinateDetail(Long userId, String cycleType, String periodKey) {
        access.requireManager();
        validatePeriod(cycleType, periodKey);
        SysUser user = access.requireVisibleActiveUser(userId);
        Map<String, Object> result = subordinateRow(user, cycleType, periodKey);
        result.put("cycleType", cycleType);
        result.put("periodKey", periodKey);
        result.put("tasks", taskRows(userId, cycleType, periodKey).stream().map(this::taskView).toList());
        FeigeWorkflowReport report = report(userId, cycleType, periodKey);
        result.put("summary", report == null ? null : report.getSummary());
        return result;
    }

    private void materializeTemplates(Long userId, String cycleType, String periodKey) {
        SysUser user = access.requireActiveUserInTenant(userId);
        List<Long> roleIds = userMapper.selectRoleIdsByUserId(userId);
        if (roleIds == null || roleIds.isEmpty()) {
            return;
        }
        List<FeigeWorkflowTemplate> templates = templateMapper.selectList(
                new LambdaQueryWrapper<FeigeWorkflowTemplate>()
                        .in(FeigeWorkflowTemplate::getRoleId, roleIds)
                        .eq(FeigeWorkflowTemplate::getCycleType, cycleType)
                        .eq(FeigeWorkflowTemplate::getEnabled, 1)
                        .orderByAsc(FeigeWorkflowTemplate::getSortNo));
        for (FeigeWorkflowTemplate template : templates) {
            long exists = taskMapper.selectCount(new LambdaQueryWrapper<FeigeWorkflowTask>()
                    .eq(FeigeWorkflowTask::getUserId, userId)
                    .eq(FeigeWorkflowTask::getTemplateId, template.getId())
                    .eq(FeigeWorkflowTask::getCycleType, cycleType)
                    .eq(FeigeWorkflowTask::getPeriodKey, periodKey));
            if (exists > 0) {
                continue;
            }
            FeigeWorkflowTask row = new FeigeWorkflowTask();
            row.setTemplateId(template.getId());
            row.setUserId(user.getId());
            row.setUserName(access.displayName(user));
            row.setRoleId(template.getRoleId());
            row.setRoleName(template.getRoleName());
            row.setDeptId(user.getDeptId());
            row.setCycleType(cycleType);
            row.setPeriodKey(periodKey);
            row.setTaskName(template.getTaskName());
            row.setCompletionStandard(template.getCompletionStandard());
            row.setWorkContent(template.getWorkContent());
            row.setSource("template");
            row.setDetailFieldsJson(template.getDetailFieldsJson());
            row.setDone(0);
            try {
                taskMapper.insert(row);
            } catch (DuplicateKeyException duplicate) {
                // 另一标签页已物化同一模板周期；数据库唯一键是最终幂等边界。
            }
        }
    }

    private Map<String, Object> subordinateRow(SysUser user, String cycleType, String periodKey) {
        List<FeigeWorkflowTask> rows = taskRows(user.getId(), cycleType, periodKey);
        int done = (int) rows.stream().filter(row -> Integer.valueOf(1).equals(row.getDone())).count();
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("userId", user.getId());
        view.put("userName", access.displayName(user));
        RoleSummary role = roleSummary(user.getId());
        view.put("roleId", role.id());
        view.put("roleName", role.name());
        view.put("deptName", deptName(user.getDeptId()));
        view.put("total", rows.size());
        view.put("done", done);
        view.put("completionRate", percent(done, rows.size()).intValue());
        view.put("submitted", report(user.getId(), cycleType, periodKey) != null);
        return view;
    }

    private Map<String, Object> reportRow(SysUser user, String cycleType, String periodKey) {
        Map<String, Object> row = subordinateRow(user, cycleType, periodKey);
        List<Map<String, Object>> days = new ArrayList<>();
        int requiredDays = 1;
        int submittedDays = 0;
        String summary = null;
        if ("day".equals(cycleType) && StringUtils.hasText(periodKey) && periodKey.length() == 7) {
            YearMonth month;
            try {
                month = YearMonth.parse(periodKey);
            } catch (DateTimeParseException e) {
                throw new BusinessException("日报报表周期应为 YYYY-MM");
            }
            requiredDays = month.lengthOfMonth();
            for (int i = 1; i <= requiredDays; i++) {
                String date = month.atDay(i).toString();
                List<FeigeWorkflowTask> tasks = taskRows(user.getId(), "day", date);
                int done = (int) tasks.stream().filter(task -> Integer.valueOf(1).equals(task.getDone())).count();
                boolean submitted = report(user.getId(), "day", date) != null;
                if (submitted) submittedDays++;
                Map<String, Object> day = new LinkedHashMap<>();
                day.put("date", date);
                day.put("submitted", submitted);
                day.put("done", done);
                day.put("total", tasks.size());
                days.add(day);
            }
        } else {
            FeigeWorkflowReport report = report(user.getId(), cycleType, periodKey);
            submittedDays = report == null ? 0 : 1;
            summary = report == null ? null : report.getSummary();
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", periodKey);
            day.put("submitted", report != null);
            day.put("done", row.get("done"));
            day.put("total", row.get("total"));
            days.add(day);
        }
        row.put("requiredDays", requiredDays);
        row.put("submittedDays", submittedDays);
        row.put("missingDays", requiredDays - submittedDays);
        row.put("completionRate", percent(submittedDays, requiredDays).intValue());
        row.put("days", days);
        row.put("summary", summary);
        return row;
    }

    private List<SysUser> visibleUsers(Long roleId, String keyword) {
        List<SysUser> users = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getStatus, 0)
                .orderByAsc(SysUser::getId));
        return users.stream()
                .filter(user -> access.canAccessUser(user.getId()))
                .filter(user -> !userMapper.existsResignedEmployee(user.getId(), user.getTenantId()))
                .filter(user -> roleId == null || safeRoleIds(user.getId()).contains(roleId))
                .filter(user -> !StringUtils.hasText(keyword)
                        || access.displayName(user).contains(keyword)
                        || deptName(user.getDeptId()).contains(keyword))
                .toList();
    }

    private boolean isRequired(Long userId) {
        List<FeigeWorkflowRequired> required = requiredMapper.selectList(
                new LambdaQueryWrapper<FeigeWorkflowRequired>().eq(FeigeWorkflowRequired::getActive, 1));
        if (required.isEmpty()) {
            return true;
        }
        Set<Long> roleIds = new LinkedHashSet<>(safeRoleIds(userId));
        return required.stream().anyMatch(row ->
                ("user".equals(row.getTargetType()) && Objects.equals(row.getTargetId(), userId))
                        || ("role".equals(row.getTargetType()) && roleIds.contains(row.getTargetId())));
    }

    private void requireTaskViewer(Long userId) {
        if (Objects.equals(userId, access.currentUserId())) {
            access.requireActiveUserInTenant(userId);
            return;
        }
        access.requireManager();
        if (!access.canAccessUser(userId)) {
            throw new AccessDeniedException("无权查看该员工的工作计划");
        }
    }

    private FeigeWorkflowTask requireOwnedTask(Long id) {
        FeigeWorkflowTask row = taskMapper.selectById(id);
        if (row == null) {
            throw new BusinessException("工作计划任务不存在或不属于当前租户");
        }
        if (!Objects.equals(row.getUserId(), access.currentUserId())) {
            throw new AccessDeniedException("只能由任务本人更新工作计划");
        }
        return row;
    }

    private List<FeigeWorkflowTask> taskRows(Long userId, String cycleType, String periodKey) {
        return taskMapper.selectList(new LambdaQueryWrapper<FeigeWorkflowTask>()
                .eq(FeigeWorkflowTask::getUserId, userId)
                .eq(StringUtils.hasText(cycleType), FeigeWorkflowTask::getCycleType, cycleType)
                .eq(StringUtils.hasText(periodKey), FeigeWorkflowTask::getPeriodKey, periodKey)
                .orderByAsc(FeigeWorkflowTask::getId));
    }

    private FeigeWorkflowReport report(Long userId, String cycleType, String periodKey) {
        return reportMapper.selectOne(new LambdaQueryWrapper<FeigeWorkflowReport>()
                .eq(FeigeWorkflowReport::getUserId, userId)
                .eq(FeigeWorkflowReport::getCycleType, cycleType)
                .eq(FeigeWorkflowReport::getPeriodKey, periodKey)
                .last("LIMIT 1"));
    }

    private FeigeWorkflowReport reportForUpdate(Long userId, String cycleType, String periodKey) {
        return reportMapper.selectOne(new LambdaQueryWrapper<FeigeWorkflowReport>()
                .eq(FeigeWorkflowReport::getUserId, userId)
                .eq(FeigeWorkflowReport::getCycleType, cycleType)
                .eq(FeigeWorkflowReport::getPeriodKey, periodKey)
                .last("LIMIT 1 FOR UPDATE"));
    }

    private Map<String, Object> taskView(FeigeWorkflowTask row) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", row.getId());
        view.put("userId", row.getUserId());
        view.put("userName", row.getUserName());
        view.put("roleId", row.getRoleId());
        view.put("roleName", row.getRoleName());
        view.put("cycleType", row.getCycleType());
        view.put("periodKey", row.getPeriodKey());
        view.put("taskName", row.getTaskName());
        view.put("completionStandard", row.getCompletionStandard());
        view.put("workContent", row.getWorkContent());
        view.put("status", workflowStatus(row));
        view.put("remark", row.getRemark());
        view.put("undoneReason", row.getUndoneReason());
        view.put("metrics", mergeMetrics(row.getDetailFieldsJson(), row.getWorkDetailJson()));
        view.put("completedTime", row.getDoneTime());
        view.put("createTime", row.getCreateTime());
        return view;
    }

    private Map<String, Object> templateView(FeigeWorkflowTemplate row) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", row.getId());
        view.put("roleId", row.getRoleId());
        view.put("roleName", row.getRoleName());
        view.put("cycleType", row.getCycleType());
        view.put("taskName", row.getTaskName());
        view.put("completionStandard", row.getCompletionStandard());
        view.put("workContent", row.getWorkContent());
        view.put("sortNo", row.getSortNo());
        view.put("enabled", Integer.valueOf(1).equals(row.getEnabled()));
        view.put("metrics", jsonList(row.getDetailFieldsJson()));
        return view;
    }

    private List<Map<String, Object>> mergeMetrics(String schemaJson, String valuesJson) {
        List<Map<String, Object>> schema = jsonMapList(schemaJson);
        List<Map<String, Object>> values = jsonMapList(valuesJson);
        Map<Object, Map<String, Object>> valueByCode = new LinkedHashMap<>();
        values.forEach(value -> valueByCode.put(value.get("code"), value));
        return schema.stream().map(metric -> {
            Map<String, Object> merged = new LinkedHashMap<>(metric);
            Map<String, Object> value = valueByCode.get(metric.get("code"));
            if (value != null) {
                merged.putAll(value);
            }
            return merged;
        }).toList();
    }

    private void validateTemplate(FeigeTaskRequests.WorkflowTemplateUpsert request) {
        validatePeriod(request.getCycleType(), samplePeriod(request.getCycleType()));
        SysRole role = access.requireActiveRole(request.getRoleId());
        if (!StringUtils.hasText(request.getTaskName())) {
            throw new BusinessException("模板任务名称不能为空");
        }
        validateTemplateMetrics(request);
        request.setRoleName(role.getRoleName());
    }

    private void validateTemplateMetrics(FeigeTaskRequests.WorkflowTemplateUpsert request) {
        if (request.getMetrics() != null) {
            Set<String> codes = new LinkedHashSet<>();
            for (FeigeTaskRequests.WorkflowMetric metric : request.getMetrics()) {
                validateMetricSchema(metric.getCode(), metric.getLabel(), metric.getFieldType(), codes);
                if (metric.getRequired() == null) {
                    throw new BusinessException("模板指标必须明确是否必填");
                }
                metric.setCode(metric.getCode().trim());
                metric.setLabel(metric.getLabel().trim());
                metric.setFieldType("number");
            }
            return;
        }
        if (!StringUtils.hasText(request.getDetailFieldsJson())) {
            return;
        }
        Set<String> codes = new LinkedHashSet<>();
        for (Map<String, Object> metric : strictMapList(request.getDetailFieldsJson(), "模板量化字段")) {
            validateMetricSchema(asText(metric.get("code")), asText(metric.get("label")),
                    asText(metric.get("fieldType")), codes);
            Object required = metric.get("required");
            if (!(required instanceof Boolean)) {
                throw new BusinessException("模板指标必须明确布尔类型 required");
            }
        }
    }

    private void validateMetricSchema(String code, String label, String fieldType, Set<String> codes) {
        if (!StringUtils.hasText(code) || !code.matches("^[a-z][a-z0-9_]{0,39}$")) {
            throw new BusinessException("模板指标编码必须以小写字母开头且仅含小写字母、数字和下划线");
        }
        if (!codes.add(code.trim())) {
            throw new BusinessException("模板指标编码不能重复");
        }
        if (!StringUtils.hasText(label)) {
            throw new BusinessException("模板指标名称不能为空");
        }
        if (!"number".equals(fieldType)) {
            throw new BusinessException("当前量化指标仅支持 number 类型");
        }
    }

    private List<Map<String, Object>> validateMetricValues(String schemaJson, String valuesJson,
                                                            boolean requireRequired) {
        List<Map<String, Object>> schema = strictMapList(schemaJson, "任务量化字段");
        List<Map<String, Object>> values = strictMapList(valuesJson, "任务量化结果");
        Set<String> schemaCodes = new LinkedHashSet<>();
        Map<String, Map<String, Object>> valueByCode = new LinkedHashMap<>();
        for (Map<String, Object> value : values) {
            String code = asText(value.get("code"));
            if (!StringUtils.hasText(code) || valueByCode.putIfAbsent(code, value) != null) {
                throw new BusinessException("任务量化结果存在空编码或重复编码");
            }
        }
        List<Map<String, Object>> normalized = new ArrayList<>();
        for (Map<String, Object> metric : schema) {
            String code = asText(metric.get("code"));
            String label = asText(metric.get("label"));
            String fieldType = asText(metric.get("fieldType"));
            validateMetricSchema(code, label, fieldType, schemaCodes);
            Object requiredFlag = metric.get("required");
            if (!(requiredFlag instanceof Boolean)) {
                throw new BusinessException("任务量化字段必须明确布尔类型 required");
            }
            Map<String, Object> provided = valueByCode.remove(code);
            Object value = provided == null ? null : provided.get("value");
            if (requireRequired && Boolean.TRUE.equals(requiredFlag)
                    && (provided == null || value == null || (value instanceof String s && !StringUtils.hasText(s)))) {
                throw new BusinessException("请填写量化指标：" + label);
            }
            BigDecimal number = value == null ? null : decimalValue(value, label);
            if (number != null && number.signum() < 0) {
                throw new BusinessException("量化指标不能小于0：" + label);
            }
            Object precision = metric.get("precision");
            if (number != null && precision instanceof Number p
                    && number.stripTrailingZeros().scale() > p.intValue()) {
                throw new BusinessException("量化指标小数位超过限制：" + label);
            }
            Map<String, Object> canonical = new LinkedHashMap<>();
            canonical.put("code", code);
            canonical.put("label", label);
            canonical.put("fieldType", "number");
            canonical.put("unit", metric.get("unit"));
            canonical.put("required", Boolean.TRUE.equals(requiredFlag));
            canonical.put("target", metric.get("target"));
            canonical.put("value", number);
            normalized.add(canonical);
        }
        if (!valueByCode.isEmpty()) {
            throw new BusinessException("任务量化结果包含模板未定义的编码");
        }
        return normalized;
    }

    private BigDecimal decimalValue(Object value, String label) {
        if (!(value instanceof Number) && !(value instanceof String)) {
            throw new BusinessException("量化指标必须是数字：" + label);
        }
        try {
            return new BigDecimal(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new BusinessException("量化指标必须是有效数字：" + label);
        }
    }

    private void copyTemplate(FeigeWorkflowTemplate row, FeigeTaskRequests.WorkflowTemplateUpsert request) {
        row.setRoleId(request.getRoleId());
        row.setRoleName(request.getRoleName());
        row.setCycleType(request.getCycleType());
        row.setTaskName(request.getTaskName().trim());
        row.setCompletionStandard(request.getCompletionStandard());
        row.setWorkContent(request.getWorkContent());
        row.setDetailFieldsJson(request.getMetrics() == null
                ? request.getDetailFieldsJson() : writeJson(request.getMetrics()));
        row.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        row.setEnabled(Boolean.FALSE.equals(request.getEnabled()) ? 0 : 1);
    }

    private FeigeWorkflowTemplate requireTemplate(Long id) {
        FeigeWorkflowTemplate row = templateMapper.selectById(id);
        if (row == null) {
            throw new BusinessException("工作计划模板不存在或不属于当前租户");
        }
        return row;
    }

    private void updateTemplateOrConflict(FeigeWorkflowTemplate row) {
        if (templateMapper.updateById(row) <= 0) {
            throw new BusinessException(409, "模板已被其他人更新，请刷新后重试");
        }
    }

    private void updateTaskOrConflict(FeigeWorkflowTask row) {
        if (taskMapper.updateById(row) <= 0) {
            throw new BusinessException(409, "工作计划已被其他人更新，请刷新后重试");
        }
    }

    private String workflowStatus(FeigeWorkflowTask row) {
        if (Integer.valueOf(1).equals(row.getDone())) return "done";
        return StringUtils.hasText(row.getUndoneReason()) ? "undone" : "pending";
    }

    private List<Long> safeRoleIds(Long userId) {
        List<Long> ids = userMapper.selectRoleIdsByUserId(userId);
        return ids == null ? List.of() : ids;
    }

    private RoleSummary roleSummary(Long userId) {
        return safeRoleIds(userId).stream().map(roleMapper::selectById)
                .filter(Objects::nonNull)
                .filter(role -> Integer.valueOf(0).equals(role.getStatus()))
                .sorted(Comparator.comparing(SysRole::getRoleSort,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(role -> new RoleSummary(role.getId(), role.getRoleName()))
                .findFirst().orElse(new RoleSummary(null, null));
    }

    private String deptName(Long deptId) {
        if (deptId == null) return "";
        SysDept dept = deptMapper.selectById(deptId);
        return dept == null ? "" : dept.getDeptName();
    }

    private void validateCycleOptional(String cycleType) {
        if (StringUtils.hasText(cycleType) && !CYCLES.contains(cycleType)) {
            throw new BusinessException("周期仅支持 day/week/month");
        }
    }

    private void validatePeriod(String cycleType, String periodKey) {
        if (!CYCLES.contains(cycleType)) {
            throw new BusinessException("周期仅支持 day/week/month");
        }
        if (!StringUtils.hasText(periodKey) || periodKey.length() > 32) {
            throw new BusinessException("周期标识不能为空");
        }
        boolean valid = switch (cycleType) {
            case "day" -> periodKey.matches("\\d{4}-\\d{2}-\\d{2}");
            case "week" -> periodKey.matches("\\d{4}-W\\d{2}");
            case "month" -> periodKey.matches("\\d{4}-\\d{2}");
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("周期标识格式不正确");
        }
    }

    private String samplePeriod(String cycleType) {
        return switch (cycleType) {
            case "day" -> "2000-01-01";
            case "week" -> "2000-W01";
            case "month" -> "2000-01";
            default -> "";
        };
    }

    private BigDecimal percent(long numerator, long denominator) {
        if (denominator <= 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(numerator).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException("工作计划数据序列化失败");
        }
    }

    private List<Object> jsonList(String json) {
        Object decoded = readJson(json);
        return decoded instanceof List<?> list ? new ArrayList<>(list) : List.of();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> jsonMapList(String json) {
        Object decoded = readJson(json);
        if (!(decoded instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?>) {
                result.add(new LinkedHashMap<>((Map<String, Object>) item));
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> strictMapList(String json, String label) {
        if (!StringUtils.hasText(json)) return List.of();
        final Object decoded;
        try {
            decoded = objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException(label + "不是有效JSON");
        }
        if (!(decoded instanceof List<?> list)) {
            throw new BusinessException(label + "必须是JSON数组");
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) {
                throw new BusinessException(label + "的每一项必须是对象");
            }
            result.add(new LinkedHashMap<>((Map<String, Object>) map));
        }
        return result;
    }

    private String asText(Object value) {
        return value instanceof String text ? text : null;
    }

    private Object readJson(String json) {
        if (!StringUtils.hasText(json)) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    private Map<String, Object> pageResult(IPage<?> page, List<?> records) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", records);
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    private int safePage(Integer value) {
        return value == null || value < 1 ? 1 : value;
    }

    private int safeSize(Integer value) {
        return value == null ? 20 : Math.max(1, Math.min(value, 200));
    }

    private record RoleSummary(Long id, String name) {
    }
}
