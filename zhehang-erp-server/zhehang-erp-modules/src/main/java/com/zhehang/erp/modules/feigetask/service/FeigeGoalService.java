package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeGoal;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeGoalPlan;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeGoalPlanUser;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalPlanMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalPlanUserMapper;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeigeGoalService {

    private static final Set<String> CYCLES = Set.of("month", "quarter", "half_year", "year");
    private static final Set<String> STATUSES = Set.of("draft", "active", "completed", "archived");

    private final FeigeGoalMapper goalMapper;
    private final FeigeGoalPlanMapper planMapper;
    private final FeigeGoalPlanUserMapper planUserMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeTaskAccessService access;

    public Map<String, Object> page(int pageNum, int pageSize, Integer year, String cycleType,
                                    String periodKey, String status, Long roleId, Long userId,
                                    String keyword) {
        validateCycleOptional(cycleType);
        if (StringUtils.hasText(status) && !STATUSES.contains(status)) {
            throw new BusinessException("未知的目标状态");
        }
        LambdaQueryWrapper<FeigeGoal> query = new LambdaQueryWrapper<>();
        query.eq(year != null, FeigeGoal::getPeriodYear, year)
                .eq(StringUtils.hasText(cycleType), FeigeGoal::getGoalType, cycleType)
                .eq(StringUtils.hasText(periodKey), FeigeGoal::getPeriodKey, periodKey)
                .eq(StringUtils.hasText(status), FeigeGoal::getStatus, status)
                .eq(roleId != null, FeigeGoal::getRoleId, roleId)
                .eq(userId != null, FeigeGoal::getUserId, userId);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeGoal::getGoalName, keyword)
                    .or().like(FeigeGoal::getMetricName, keyword)
                    .or().like(FeigeGoal::getUserName, keyword));
        }
        dataScopeHelper.apply(query, FeigeGoal::getOwnerId, FeigeGoal::getDeptId);
        query.orderByDesc(FeigeGoal::getPeriodYear)
                .orderByAsc(FeigeGoal::getSortNo)
                .orderByDesc(FeigeGoal::getId);
        IPage<FeigeGoal> page = goalMapper.selectPage(
                new Page<>(safePage(pageNum), safeSize(pageSize)), query);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", page.getRecords().stream().map(this::view).toList());
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(FeigeTaskRequests.GoalUpsert request) {
        access.requireManager();
        ValidatedTarget target = validate(request);
        FeigeGoal row = new FeigeGoal();
        copy(row, request, target);
        row.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "draft");
        if (!Set.of("draft", "active").contains(row.getStatus())) {
            throw new BusinessException("新目标状态仅支持 draft/active");
        }
        if (goalMapper.insert(row) <= 0) {
            throw new BusinessException("目标创建失败");
        }
        replacePlans(row.getId(), request.getPlans());
        access.log("goal", row.getId(), "create", null, row.getStatus(), "创建目标", null);
        return row.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, FeigeTaskRequests.GoalUpsert request) {
        access.requireManager();
        FeigeGoal row = requireVisible(id);
        if (!Set.of("draft", "active").contains(row.getStatus())) {
            throw new BusinessException(409, "已完成或归档目标不能编辑");
        }
        ValidatedTarget target = validate(request);
        copy(row, request, target);
        updateOrConflict(row);
        if (request.getPlans() != null) {
            replacePlans(id, request.getPlans());
        }
        access.log("goal", id, "update", row.getStatus(), row.getStatus(), "更新目标", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void changeStatus(Long id, FeigeTaskRequests.GoalStatus request) {
        access.requireManager();
        FeigeGoal row = requireVisible(id);
        if (!STATUSES.contains(request.getStatus())) {
            throw new BusinessException("未知的目标状态");
        }
        if (!allowed(row.getStatus(), request.getStatus())) {
            throw new BusinessException(409, "目标状态不能按该路径变更");
        }
        String from = row.getStatus();
        row.setStatus(request.getStatus());
        row.setCompletionNote(request.getCompletionNote());
        updateOrConflict(row);
        access.log("goal", id, "status", from, row.getStatus(), "变更目标状态", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        access.requireManager();
        FeigeGoal row = requireVisible(id);
        if (!Set.of("draft", "archived").contains(row.getStatus())) {
            throw new BusinessException(409, "只有草稿或已归档目标可以删除");
        }
        deletePlans(id);
        if (goalMapper.deleteById(id) <= 0) {
            throw new BusinessException(409, "目标已被其他人删除，请刷新后重试");
        }
        access.log("goal", id, "delete", row.getStatus(), null, "删除目标", null);
    }

    private ValidatedTarget validate(FeigeTaskRequests.GoalUpsert request) {
        validateCycle(request.getCycleType(), request.getPeriodKey(), request.getYear());
        SysRole role = request.getRoleId() == null ? null : access.requireActiveRole(request.getRoleId());
        SysUser user = request.getUserId() == null ? null : access.requireVisibleActiveUser(request.getUserId());
        if (role == null && user == null) {
            throw new BusinessException("目标必须指定角色或员工");
        }
        if (request.getTargetValue() == null || request.getTargetValue().signum() < 0) {
            throw new BusinessException("目标值不能为空且不能小于0");
        }
        if (request.getActualValue() != null && request.getActualValue().signum() < 0) {
            throw new BusinessException("实际值不能小于0");
        }
        return new ValidatedTarget(role, user);
    }

    private void copy(FeigeGoal row, FeigeTaskRequests.GoalUpsert request, ValidatedTarget target) {
        row.setGoalName(request.getTitle().trim());
        row.setGoalType(request.getCycleType());
        row.setRoleId(target.role() == null ? null : target.role().getId());
        row.setRoleName(target.role() == null ? null : target.role().getRoleName());
        row.setUserId(target.user() == null ? null : target.user().getId());
        row.setUserName(target.user() == null ? null : access.displayName(target.user()));
        row.setOwnerId(target.user() == null ? access.currentUserId() : target.user().getId());
        row.setDeptId(target.user() == null ? access.currentUser().getDeptId() : target.user().getDeptId());
        row.setPeriodYear(request.getYear());
        row.setPeriodKey(request.getPeriodKey());
        row.setMetricName(request.getMetricName());
        row.setTargetValue(request.getTargetValue());
        row.setActualValue(request.getActualValue() == null ? BigDecimal.ZERO : request.getActualValue());
        row.setUnit(request.getUnit());
        row.setGoalDesc(request.getDescription());
        row.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
    }

    private void replacePlans(Long goalId, List<FeigeTaskRequests.GoalPlanPayload> requests) {
        if (requests == null) return;
        deletePlans(goalId);
        int sort = 0;
        for (FeigeTaskRequests.GoalPlanPayload request : requests) {
            if (request.getStartDate() != null && request.getEndDate() != null
                    && request.getEndDate().isBefore(request.getStartDate())) {
                throw new BusinessException("计划结束日期不能早于开始日期");
            }
            FeigeGoalPlan plan = new FeigeGoalPlan();
            plan.setGoalId(goalId);
            plan.setPlanName(request.getTitle());
            plan.setPlanDesc(request.getDescription());
            plan.setStartDate(request.getStartDate());
            plan.setEndDate(request.getEndDate());
            plan.setSortNo(sort++);
            plan.setStatus("active");
            if (planMapper.insert(plan) <= 0) {
                throw new BusinessException("目标计划保存失败");
            }
            if (request.getUsers() == null) continue;
            Set<Long> unique = new java.util.HashSet<>();
            for (FeigeTaskRequests.GoalPlanUserPayload assignment : request.getUsers()) {
                if (!unique.add(assignment.getUserId())) {
                    throw new BusinessException("同一计划不能重复分配同一员工");
                }
                SysUser user = access.requireVisibleActiveUser(assignment.getUserId());
                FeigeGoalPlanUser link = new FeigeGoalPlanUser();
                link.setPlanId(plan.getId());
                link.setGoalId(goalId);
                link.setUserId(user.getId());
                link.setUserName(access.displayName(user));
                link.setDeptId(user.getDeptId());
                link.setTargetValue(assignment.getTargetValue());
                link.setActualValue(assignment.getActualValue());
                if (planUserMapper.insert(link) <= 0) {
                    throw new BusinessException("目标计划人员保存失败");
                }
            }
        }
    }

    private void deletePlans(Long goalId) {
        planUserMapper.delete(new LambdaQueryWrapper<FeigeGoalPlanUser>()
                .eq(FeigeGoalPlanUser::getGoalId, goalId));
        planMapper.delete(new LambdaQueryWrapper<FeigeGoalPlan>()
                .eq(FeigeGoalPlan::getGoalId, goalId));
    }

    private FeigeGoal requireVisible(Long id) {
        FeigeGoal row = goalMapper.selectById(id);
        if (row == null) {
            throw new BusinessException("目标不存在或不属于当前租户");
        }
        if (!access.canAccess(row.getOwnerId(), row.getDeptId())) {
            throw new AccessDeniedException("无权访问该目标");
        }
        return row;
    }

    private Map<String, Object> view(FeigeGoal row) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", row.getId());
        result.put("roleId", row.getRoleId());
        result.put("roleName", row.getRoleName());
        result.put("userId", row.getUserId());
        result.put("userName", row.getUserName());
        result.put("year", row.getPeriodYear());
        result.put("cycleType", row.getGoalType());
        result.put("periodKey", row.getPeriodKey());
        result.put("title", row.getGoalName());
        result.put("metricName", row.getMetricName());
        result.put("targetValue", row.getTargetValue());
        result.put("actualValue", row.getActualValue());
        result.put("unit", row.getUnit());
        result.put("status", row.getStatus());
        result.put("description", row.getGoalDesc());
        result.put("completionNote", row.getCompletionNote());
        result.put("plans", planViews(row.getId()));
        result.put("createTime", row.getCreateTime());
        return result;
    }

    private List<Map<String, Object>> planViews(Long goalId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (FeigeGoalPlan plan : planMapper.selectList(new LambdaQueryWrapper<FeigeGoalPlan>()
                .eq(FeigeGoalPlan::getGoalId, goalId)
                .orderByAsc(FeigeGoalPlan::getSortNo))) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", plan.getId());
            row.put("title", plan.getPlanName());
            row.put("description", plan.getPlanDesc());
            row.put("startDate", plan.getStartDate());
            row.put("endDate", plan.getEndDate());
            row.put("users", planUserMapper.selectList(new LambdaQueryWrapper<FeigeGoalPlanUser>()
                            .eq(FeigeGoalPlanUser::getPlanId, plan.getId())
                            .orderByAsc(FeigeGoalPlanUser::getId))
                    .stream().map(user -> {
                        Map<String, Object> assignment = new LinkedHashMap<>();
                        assignment.put("id", user.getId());
                        assignment.put("userId", user.getUserId());
                        assignment.put("userName", user.getUserName());
                        assignment.put("targetValue", user.getTargetValue());
                        assignment.put("actualValue", user.getActualValue());
                        return assignment;
                    }).toList());
            result.add(row);
        }
        return result;
    }

    public static boolean allowed(String from, String to) {
        if (Objects.equals(from, to)) return false;
        return switch (from) {
            case "draft" -> Set.of("active", "archived").contains(to);
            case "active" -> Set.of("completed", "archived").contains(to);
            case "completed" -> "archived".equals(to);
            default -> false;
        };
    }

    private void updateOrConflict(FeigeGoal row) {
        if (goalMapper.updateById(row) <= 0) {
            throw new BusinessException(409, "目标已被其他人更新，请刷新后重试");
        }
    }

    private void validateCycleOptional(String cycle) {
        if (StringUtils.hasText(cycle) && !CYCLES.contains(cycle)) {
            throw new BusinessException("目标周期仅支持 month/quarter/half_year/year");
        }
    }

    private void validateCycle(String cycle, String periodKey, Integer year) {
        validateCycleOptional(cycle);
        if (!StringUtils.hasText(cycle) || year == null || year < 2000 || year > 2200) {
            throw new BusinessException("目标周期和年份不能为空");
        }
        boolean valid = periodKey != null && switch (cycle) {
            case "month" -> periodKey.matches(year + "-(0[1-9]|1[0-2])");
            case "quarter" -> periodKey.matches(year + "-Q[1-4]");
            case "half_year" -> periodKey.matches(year + "-H[12]");
            case "year" -> periodKey.equals(String.valueOf(year));
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("目标周期标识与年份不匹配");
        }
    }

    private int safePage(Integer value) {
        return value == null || value < 1 ? 1 : value;
    }

    private int safeSize(Integer value) {
        return value == null ? 20 : Math.max(1, Math.min(value, 200));
    }

    private record ValidatedTarget(SysRole role, SysUser user) {
    }
}
