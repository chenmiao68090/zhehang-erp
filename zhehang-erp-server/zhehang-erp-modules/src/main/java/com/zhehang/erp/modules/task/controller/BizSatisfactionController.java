package com.zhehang.erp.modules.task.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.task.domain.BizSatisfaction;
import com.zhehang.erp.modules.task.mapper.BizSatisfactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/satisfaction")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('boss', 'super_admin', 'dept_manager', 'manager', 'sales', 'online_sales')")
public class BizSatisfactionController {

    private static final Set<String> VISIT_METHODS = Set.of("phone", "wechat", "meeting");
    private static final Set<String> VISIT_TYPES = Set.of(
            "first_service", "3month", "6month", "12month", "complaint", "manual");
    private static final DateTimeFormatter VISIT_NO_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final BizSatisfactionMapper satisfactionMapper;
    private final CrmCustomerMapper customerMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<BizSatisfaction>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<BizSatisfaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, BizSatisfaction::getCustomerId, customerId)
                .orderByDesc(BizSatisfaction::getCreateTime);
        applyVisibility(wrapper);
        if (Integer.valueOf(0).equals(status)) {
            wrapper.isNull(BizSatisfaction::getVisitTime);
        } else if (Integer.valueOf(1).equals(status)) {
            wrapper.isNotNull(BizSatisfaction::getVisitTime);
        } else if (status != null) {
            wrapper.eq(BizSatisfaction::getId, -1L);
        }
        return R.ok(satisfactionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping
    @Log(module = "客户回访", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizSatisfaction satisfaction) {
        if (satisfaction.getCustomerId() == null) {
            return R.fail("请选择关联客户");
        }
        CrmCustomer customer = customerMapper.selectById(satisfaction.getCustomerId());
        if (customer == null || !dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            return R.fail("客户不存在或您无权回访");
        }
        satisfaction.setId(null);
        satisfaction.setVisitNo(newVisitNo());
        satisfaction.setVisitType(defaultText(satisfaction.getVisitType(), "manual"));
        if (!VISIT_TYPES.contains(satisfaction.getVisitType())) {
            return R.fail("回访类型不正确");
        }
        satisfaction.setVisitMethod(defaultText(satisfaction.getVisitMethod(), "phone"));
        satisfaction.setVisitorId(currentUserOr(satisfaction.getVisitorId()));
        satisfaction.setEscalationTaskId(null);
        satisfaction.setTenantId(null);
        satisfaction.setCreateBy(null);
        satisfaction.setUpdateBy(null);
        satisfaction.setDeleted(null);
        if (satisfaction.getScore() != null) {
            R<Void> validation = validateResult(satisfaction);
            if (validation != null) {
                return R.fail(validation.getMessage());
            }
            // 回访完成时间以服务端提交时刻为准，忽略客户端时区与可篡改时间。
            satisfaction.setVisitTime(LocalDateTime.now());
        } else {
            satisfaction.setVisitTime(null);
        }
        satisfactionMapper.insert(satisfaction);
        return R.ok(satisfaction.getId());
    }

    @PutMapping("/{id}/complete")
    @Log(module = "客户回访", type = Log.OperationType.UPDATE)
    public R<Void> complete(@PathVariable Long id, @RequestBody BizSatisfaction result) {
        BizSatisfaction existing = satisfactionMapper.selectById(id);
        if (existing == null) {
            return R.fail("回访记录不存在");
        }
        if (!canAccess(existing)) {
            return R.fail("无权操作该回访记录");
        }
        if (isCompleted(existing)) {
            return R.ok();
        }
        if (existing.getVisitTime() != null) {
            return R.fail("当前回访状态不可提交结果");
        }
        R<Void> validation = validateResult(result);
        if (validation != null) {
            return validation;
        }
        BizSatisfaction update = new BizSatisfaction();
        update.setVisitMethod(result.getVisitMethod());
        update.setVisitorId(currentUserOr(existing.getVisitorId()));
        update.setVisitTime(LocalDateTime.now());
        update.setScore(result.getScore());
        update.setEvaluation(result.getEvaluation());
        update.setProblems(result.getProblems());
        update.setSuggestions(result.getSuggestions());
        update.setWillingReferral(result.getWillingReferral());
        update.setFollowUpItems(result.getFollowUpItems());
        int changed = satisfactionMapper.update(update, new LambdaUpdateWrapper<BizSatisfaction>()
                .eq(BizSatisfaction::getId, id)
                .isNull(BizSatisfaction::getVisitTime));
        if (changed == 0) {
            BizSatisfaction latest = satisfactionMapper.selectById(id);
            if (latest != null && isCompleted(latest)) {
                return R.ok();
            }
            return R.fail("回访记录已发生变化，请刷新后重试");
        }
        return R.ok();
    }

    private R<Void> validateResult(BizSatisfaction result) {
        if (result.getScore() == null || result.getScore() < 1 || result.getScore() > 5) {
            return R.fail("满意度评分必须在1到5分之间");
        }
        if (result.getVisitMethod() == null || !VISIT_METHODS.contains(result.getVisitMethod())) {
            return R.fail("回访方式不正确");
        }
        return null;
    }

    private boolean isCompleted(BizSatisfaction satisfaction) {
        return satisfaction.getVisitTime() != null && satisfaction.getScore() != null;
    }

    private Long currentUserOr(Long fallback) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return currentUserId != null ? currentUserId : fallback;
    }

    private String newVisitNo() {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "HF" + LocalDateTime.now().format(VISIT_NO_TIME) + random;
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    @GetMapping("/pending")
    public R<IPage<BizSatisfaction>> pending(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        LambdaQueryWrapper<BizSatisfaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(BizSatisfaction::getVisitTime)
                .orderByAsc(BizSatisfaction::getCreateTime);
        applyVisibility(wrapper);
        return R.ok(satisfactionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    private void applyVisibility(LambdaQueryWrapper<BizSatisfaction> wrapper) {
        if (canManageAll()) {
            return;
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            wrapper.eq(BizSatisfaction::getId, -1L);
        } else {
            wrapper.eq(BizSatisfaction::getVisitorId, currentUserId);
        }
    }

    private boolean canAccess(BizSatisfaction satisfaction) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return canManageAll()
                || (currentUserId != null && currentUserId.equals(satisfaction.getVisitorId()));
    }

    private boolean canManageAll() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "super_admin");
    }
}
