package com.zhehang.erp.modules.dashboard.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.dashboard.domain.entity.DashboardMemo;
import com.zhehang.erp.modules.dashboard.mapper.DashboardMemoMapper;
import com.zhehang.erp.modules.dashboard.service.IDashboardMemoService;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardMemoServiceImpl extends ServiceImpl<DashboardMemoMapper, DashboardMemo> implements IDashboardMemoService {

    private final GovernedFieldValueValidator governedFieldValueValidator;

    @Override
    public List<DashboardMemo> listMine(String scope, Boolean completed, String keyword, Integer limit) {
        Long uid = SecurityUtils.getCurrentUserId();
        LambdaQueryWrapper<DashboardMemo> wrapper = new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getUserId, uid)
                .eq(completed != null, DashboardMemo::getCompleted, completed)
                .like(StringUtils.hasText(keyword), DashboardMemo::getContent, keyword);

        applyScope(wrapper, scope);
        wrapper.orderByAsc(DashboardMemo::getCompleted)
                .orderByDesc(DashboardMemo::getPriority)
                .orderByAsc(DashboardMemo::getRemindTime)
                .orderByDesc(DashboardMemo::getUpdateTime)
                .last("limit " + safeLimit(limit));
        return list(wrapper);
    }

    @Override
    public Map<String, Long> summary() {
        Long uid = SecurityUtils.getCurrentUserId();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = todayStart.plusDays(1);
        Map<String, Long> data = new HashMap<>();
        data.put("pending", count(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getUserId, uid)
                .eq(DashboardMemo::getCompleted, false)));
        data.put("today", count(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getUserId, uid)
                .ge(DashboardMemo::getRemindTime, todayStart)
                .lt(DashboardMemo::getRemindTime, tomorrowStart)));
        data.put("doneToday", count(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getUserId, uid)
                .eq(DashboardMemo::getCompleted, true)
                .ge(DashboardMemo::getCompletedTime, todayStart)
                .lt(DashboardMemo::getCompletedTime, tomorrowStart)));
        data.put("overdue", count(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getUserId, uid)
                .eq(DashboardMemo::getCompleted, false)
                .lt(DashboardMemo::getRemindTime, LocalDateTime.now())));
        return data;
    }

    @Override
    public boolean add(DashboardMemo memo) {
        normalize(memo, false);
        memo.setCategory(governedFieldValueValidator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY, "备忘分类", memo.getCategory(), false));
        memo.setUserId(SecurityUtils.getCurrentUserId());
        if (Boolean.TRUE.equals(memo.getCompleted()) && memo.getCompletedTime() == null) {
            memo.setCompletedTime(LocalDateTime.now());
        }
        return save(memo);
    }

    @Override
    public boolean updateMine(DashboardMemo memo) {
        if (memo.getId() == null) {
            throw new BusinessException("备忘录ID不能为空");
        }
        Long id = memo.getId();
        Long uid = SecurityUtils.getCurrentUserId();
        DashboardMemo existing = getOne(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getId, id)
                .eq(DashboardMemo::getUserId, uid)
                .last("LIMIT 1"));
        if (existing == null) {
            throw new BusinessException("备忘录不存在或无权修改");
        }
        normalize(memo, true);
        memo.setCategory(governedFieldValueValidator.validateChangedValue(
                GovernedFieldValueValidator.MEMO_CATEGORY, "备忘分类",
                existing.getCategory(), memo.getCategory(), false));
        if (Boolean.TRUE.equals(memo.getCompleted()) && memo.getCompletedTime() == null) {
            memo.setCompletedTime(LocalDateTime.now());
        }
        LambdaUpdateWrapper<DashboardMemo> wrapper = new LambdaUpdateWrapper<DashboardMemo>()
                .eq(DashboardMemo::getId, id)
                .eq(DashboardMemo::getUserId, uid);
        if (Boolean.FALSE.equals(memo.getCompleted())) {
            wrapper.set(DashboardMemo::getCompletedTime, null);
        }
        memo.setId(null);
        return update(memo, wrapper);
    }

    @Override
    public boolean setCompleted(Long id, Boolean completed) {
        Long uid = SecurityUtils.getCurrentUserId();
        boolean done = Boolean.TRUE.equals(completed);
        return update(new LambdaUpdateWrapper<DashboardMemo>()
                .eq(DashboardMemo::getId, id)
                .eq(DashboardMemo::getUserId, uid)
                .set(DashboardMemo::getCompleted, done)
                .set(DashboardMemo::getCompletedTime, done ? LocalDateTime.now() : null));
    }

    @Override
    public boolean removeMine(Long id) {
        Long uid = SecurityUtils.getCurrentUserId();
        return remove(new LambdaQueryWrapper<DashboardMemo>()
                .eq(DashboardMemo::getId, id)
                .eq(DashboardMemo::getUserId, uid));
    }

    private void normalize(DashboardMemo memo, boolean keepUserId) {
        if (!StringUtils.hasText(memo.getContent())) {
            throw new BusinessException("请填写备忘内容");
        }
        memo.setContent(memo.getContent().trim());
        if (memo.getContent().length() > 500) {
            throw new BusinessException("备忘内容不能超过500字");
        }
        if (memo.getPriority() == null || memo.getPriority() < 1 || memo.getPriority() > 3) {
            memo.setPriority(2);
        }
        if (memo.getCompleted() == null) {
            memo.setCompleted(false);
        }
        if (StringUtils.hasText(memo.getCategory())) {
            memo.setCategory(memo.getCategory().trim());
        }
        if (StringUtils.hasText(memo.getRemark())) {
            memo.setRemark(memo.getRemark().trim());
        }
        if (!keepUserId) {
            memo.setId(null);
        }
        memo.setUserId(null);
    }

    private void applyScope(LambdaQueryWrapper<DashboardMemo> wrapper, String scope) {
        if ("today".equals(scope)) {
            LocalDateTime start = LocalDate.now().atStartOfDay();
            wrapper.ge(DashboardMemo::getRemindTime, start).lt(DashboardMemo::getRemindTime, start.plusDays(1));
        } else if ("week".equals(scope)) {
            LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);
            wrapper.ge(DashboardMemo::getRemindTime, monday.atStartOfDay())
                    .lt(DashboardMemo::getRemindTime, monday.plusDays(7).atStartOfDay());
        }
    }

    private int safeLimit(Integer limit) {
        if (limit == null) {
            return 30;
        }
        return Math.min(Math.max(limit, 1), 100);
    }
}
