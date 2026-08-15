package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.dto.CrmPoolRuleConfigDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import com.zhehang.erp.modules.crm.mapper.CrmPoolRuleUsageMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolRuleVersionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CrmPoolRuleService {
    public static final String MANUAL_ENTRY = "MANUAL_ENTRY";
    public static final String BATCH_IMPORT = "BATCH_IMPORT";
    public static final int MAX_SINGLE_CLAIM_LIMIT = 10_000;
    public static final int MAX_SINGLE_IMPORT_LIMIT = 100_000;
    private static final String DAILY_CLAIM_KEY = "crm:claim:daily:";

    private final CrmPoolRuleVersionMapper versionMapper;
    private final CrmPoolRuleUsageMapper usageMapper;
    private final StringRedisTemplate redisTemplate;

    public CrmPoolRuleVersion current() {
        return current(requireTenantId());
    }

    public CrmPoolRuleVersion current(Long tenantId) {
        if (tenantId == null) {
            return defaults();
        }
        CrmPoolRuleVersion row = versionMapper.selectOne(new LambdaQueryWrapper<CrmPoolRuleVersion>()
                .eq(CrmPoolRuleVersion::getTenantId, tenantId)
                .in(CrmPoolRuleVersion::getStatus, "ACTIVE", "SCHEDULED")
                .le(CrmPoolRuleVersion::getEffectiveTime, LocalDateTime.now())
                .orderByDesc(CrmPoolRuleVersion::getVersionNo)
                .last("LIMIT 1"));
        return row == null ? defaults() : row;
    }

    public List<CrmPoolRuleVersion> versions() {
        Long tenantId = requireTenantId();
        List<CrmPoolRuleVersion> rows = versionMapper.selectList(new LambdaQueryWrapper<CrmPoolRuleVersion>()
                .eq(CrmPoolRuleVersion::getTenantId, requireTenantId())
                .orderByDesc(CrmPoolRuleVersion::getVersionNo));
        CrmPoolRuleVersion effective = current(tenantId);
        if (effective.getId() == null) {
            return rows;
        }
        for (CrmPoolRuleVersion row : rows) {
            if (effective.getId().equals(row.getId())) {
                row.setStatus("ACTIVE");
            } else if ("ACTIVE".equals(row.getStatus())) {
                row.setStatus("ARCHIVED");
            }
        }
        return rows;
    }

    public Map<String, Object> overview() {
        Long tenantId = requireTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        CrmPoolRuleVersion active = current(tenantId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("active", active);
        result.put("canManage", canManageRules());
        result.put("todayClaimed", readClaimUsage(userId));
        result.put("todayManualEntered", used(tenantId, userId, MANUAL_ENTRY));
        result.put("todayImported", used(tenantId, userId, BATCH_IMPORT));
        result.put("versions", versions());
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public CrmPoolRuleVersion saveDraft(CrmPoolRuleConfigDTO input) {
        requireRuleAdmin();
        validate(input);
        Long tenantId = requireTenantId();
        CrmPoolRuleVersion draft;
        if (input.getId() != null) {
            draft = versionMapper.selectOne(new LambdaQueryWrapper<CrmPoolRuleVersion>()
                    .eq(CrmPoolRuleVersion::getId, input.getId())
                    .eq(CrmPoolRuleVersion::getTenantId, tenantId)
                    .eq(CrmPoolRuleVersion::getStatus, "DRAFT")
                    .last("LIMIT 1"));
            if (draft == null) {
                throw new BusinessException(409, "草稿不存在或已发布，请刷新后重试");
            }
        } else {
            Integer maxVersion = versions().stream().map(CrmPoolRuleVersion::getVersionNo)
                    .filter(java.util.Objects::nonNull).max(Integer::compareTo).orElse(0);
            draft = new CrmPoolRuleVersion();
            draft.setTenantId(tenantId);
            draft.setVersionNo(maxVersion + 1);
            draft.setStatus("DRAFT");
        }
        copy(input, draft);
        if (draft.getId() == null) {
            versionMapper.insert(draft);
        } else {
            versionMapper.updateById(draft);
        }
        return draft;
    }

    public Map<String, Object> simulate(CrmPoolRuleConfigDTO input) {
        requireRuleAdmin();
        validate(input);
        Long tenantId = requireTenantId();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ownersOverHolding", versionMapper.countOwnersOverHolding(tenantId, input.getPrivateHoldingLimit()));
        result.put("recycleCandidates", versionMapper.countRecycleCandidates(tenantId, LocalDate.now(),
                LocalDateTime.now().minusDays(input.getRecycleNoFollowDays())));
        result.put("effectiveTime", LocalDate.now().plusDays(1).atStartOfDay());
        result.put("readOnly", true);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public CrmPoolRuleVersion publish(Long id, String mode) {
        requireRuleAdmin();
        Long tenantId = requireTenantId();
        CrmPoolRuleVersion draft = versionMapper.selectOne(new LambdaQueryWrapper<CrmPoolRuleVersion>()
                .eq(CrmPoolRuleVersion::getId, id)
                .eq(CrmPoolRuleVersion::getTenantId, tenantId)
                .eq(CrmPoolRuleVersion::getStatus, "DRAFT").last("LIMIT 1"));
        if (draft == null) {
            throw new BusinessException(409, "草稿不存在或已发布，请刷新后重试");
        }
        boolean immediate = "IMMEDIATE".equalsIgnoreCase(mode);
        LocalDateTime effective = immediate ? LocalDateTime.now() : LocalDate.now().plusDays(1).atStartOfDay();
        LambdaUpdateWrapper<CrmPoolRuleVersion> archive = new LambdaUpdateWrapper<CrmPoolRuleVersion>()
                .eq(CrmPoolRuleVersion::getTenantId, tenantId);
        if (immediate) {
            archive.in(CrmPoolRuleVersion::getStatus, "ACTIVE", "SCHEDULED");
        } else {
            archive.eq(CrmPoolRuleVersion::getStatus, "SCHEDULED");
        }
        versionMapper.update(null, archive
                .set(CrmPoolRuleVersion::getStatus, "ARCHIVED"));
        draft.setStatus(immediate ? "ACTIVE" : "SCHEDULED");
        draft.setEffectiveTime(effective);
        draft.setPublishedBy(SecurityUtils.getCurrentUserId());
        draft.setPublishedTime(LocalDateTime.now());
        versionMapper.updateById(draft);
        return draft;
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeDaily(String metricCode, int delta) {
        if (delta <= 0) {
            return;
        }
        Long tenantId = requireTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(401, "登录已失效，请重新登录");
        }
        int limit = BATCH_IMPORT.equals(metricCode) ? current(tenantId).getDailyImportLimit()
                : current(tenantId).getDailyManualEntryLimit();
        LocalDate today = LocalDate.now();
        usageMapper.ensureRow(tenantId, today, userId, metricCode);
        int used = java.util.Optional.ofNullable(
                usageMapper.selectUsedForUpdate(tenantId, today, userId, metricCode)).orElse(0);
        if ((long) used + delta > limit) {
            throw new BusinessException("超出今日" + (BATCH_IMPORT.equals(metricCode) ? "导入" : "录入")
                    + "上限(" + limit + ")，今日已使用 " + used + " 条");
        }
        if (usageMapper.addUsed(tenantId, today, userId, metricCode, delta) != 1) {
            throw new BusinessException("数量额度更新失败，请稍后重试");
        }
    }

    public void assertDailyCapacity(String metricCode, int requested) {
        Long tenantId = requireTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        int limit = BATCH_IMPORT.equals(metricCode) ? current(tenantId).getDailyImportLimit()
                : current(tenantId).getDailyManualEntryLimit();
        int used = used(tenantId, userId, metricCode);
        if ((long) used + Math.max(0, requested) > limit) {
            throw new BusinessException("今日剩余额度不足：上限 " + limit + " 条，已使用 " + used + " 条");
        }
    }

    public List<Long> tenantIdsWithLeads() {
        return versionMapper.selectLeadTenantIds();
    }

    private int used(Long tenantId, Long userId, String metricCode) {
        if (tenantId == null || userId == null) {
            return 0;
        }
        return java.util.Optional.ofNullable(
                usageMapper.selectUsed(tenantId, LocalDate.now(), userId, metricCode)).orElse(0);
    }

    private long readClaimUsage(Long userId) {
        if (userId == null) {
            return 0L;
        }
        String value = redisTemplate.opsForValue().get(DAILY_CLAIM_KEY + userId + ":" + LocalDate.now());
        try {
            return value == null ? 0L : Long.parseLong(value);
        } catch (NumberFormatException ignored) {
            return 0L;
        }
    }

    private void validate(CrmPoolRuleConfigDTO c) {
        if (c == null) {
            throw new BusinessException("规则不能为空");
        }
        range(c.getDailyClaimLimit(), 1, 10000, "每日领取上限");
        range(c.getSingleClaimLimit(), 1, MAX_SINGLE_CLAIM_LIMIT, "单次领取上限");
        range(c.getDailyManualEntryLimit(), 1, 10000, "每日录入上限");
        range(c.getSingleImportLimit(), 1, MAX_SINGLE_IMPORT_LIMIT, "单次导入上限");
        range(c.getDailyImportLimit(), 1, 100000, "每日导入上限");
        range(c.getPrivateHoldingLimit(), 1, 10000, "私海容量");
        range(c.getPrivateWarningPercent(), 50, 100, "容量预警比例");
        range(c.getProtectionDays(), 1, 365, "保护期");
        range(c.getRecycleNoFollowDays(), 1, 365, "未跟进回收天数");
        range(c.getRecycleWarningDays(), 1, 30, "回收预警天数");
        range(c.getReleaseCooldownDays(), 0, 365, "领取冷却天数");
        if (c.getRecycleWarningDays() >= c.getRecycleNoFollowDays()) {
            throw new BusinessException("回收预警天数必须小于未跟进回收天数");
        }
        if (c.getSingleClaimLimit() > c.getDailyClaimLimit()) {
            throw new BusinessException("单次领取上限不能大于每日领取上限");
        }
        if (c.getSingleImportLimit() > c.getDailyImportLimit()) {
            throw new BusinessException("单次导入上限不能大于每日导入上限");
        }
        if (StringUtils.hasText(c.getChangeSummary()) && c.getChangeSummary().trim().length() > 255) {
            throw new BusinessException("变更说明不能超过255个字");
        }
    }

    private void range(Integer value, int min, int max, String name) {
        if (value == null || value < min || value > max) {
            throw new BusinessException(name + "应在 " + min + " 至 " + max + " 之间");
        }
    }

    private void copy(CrmPoolRuleConfigDTO s, CrmPoolRuleVersion t) {
        t.setDailyClaimLimit(s.getDailyClaimLimit());
        t.setSingleClaimLimit(s.getSingleClaimLimit());
        t.setDailyManualEntryLimit(s.getDailyManualEntryLimit());
        t.setSingleImportLimit(s.getSingleImportLimit());
        t.setDailyImportLimit(s.getDailyImportLimit());
        t.setPrivateHoldingLimit(s.getPrivateHoldingLimit());
        t.setPrivateWarningPercent(s.getPrivateWarningPercent());
        t.setProtectionDays(s.getProtectionDays());
        t.setRecycleNoFollowDays(s.getRecycleNoFollowDays());
        t.setRecycleWarningDays(s.getRecycleWarningDays());
        t.setReleaseCooldownDays(s.getReleaseCooldownDays());
        t.setDuplicateBlockEnabled(Boolean.FALSE.equals(s.getDuplicateBlockEnabled()) ? 0 : 1);
        t.setChangeSummary(StringUtils.hasText(s.getChangeSummary()) ? s.getChangeSummary().trim() : "规则调整");
    }

    private CrmPoolRuleVersion defaults() {
        CrmPoolRuleVersion c = new CrmPoolRuleVersion();
        c.setVersionNo(1);
        c.setStatus("ACTIVE");
        c.setEffectiveTime(LocalDateTime.of(LocalDate.of(2026, 1, 1), LocalTime.MIN));
        c.setDailyClaimLimit(1000);
        c.setSingleClaimLimit(1000);
        c.setDailyManualEntryLimit(1000);
        c.setSingleImportLimit(1000);
        c.setDailyImportLimit(10000);
        c.setPrivateHoldingLimit(1000);
        c.setPrivateWarningPercent(90);
        c.setProtectionDays(15);
        c.setRecycleNoFollowDays(15);
        c.setRecycleWarningDays(3);
        c.setReleaseCooldownDays(15);
        c.setDuplicateBlockEnabled(1);
        c.setChangeSummary("系统兼容默认规则");
        return c;
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException(401, "未识别当前公司，请重新登录");
        }
        return tenantId;
    }

    private void requireRuleAdmin() {
        if (!canManageRules()) {
            throw new BusinessException(403, "仅老板或超级管理员可修改并发布公海私海规则");
        }
    }

    private boolean canManageRules() {
        return !SecurityUtils.isImpersonating()
                && (SecurityUtils.canManageTenantSuperAdmin() || SecurityUtils.hasAnyRole("boss"));
    }
}
