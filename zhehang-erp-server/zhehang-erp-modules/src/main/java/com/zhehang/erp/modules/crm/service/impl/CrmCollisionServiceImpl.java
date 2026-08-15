package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.dto.DuplicateCheckResult;
import com.zhehang.erp.modules.crm.domain.entity.CrmCollisionLog;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmCollisionLogMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmCollisionService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmCollisionServiceImpl extends ServiceImpl<CrmCollisionLogMapper, CrmCollisionLog> implements ICrmCollisionService {

    private static final Set<String> RESOLUTION_TYPES = Set.of("keep_a", "keep_b", "merge", "cooperate");

    private final CrmCollisionLogMapper collisionLogMapper;
    private final CrmLeadMapper leadMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public List<CrmLead> checkDuplicate(String creditCode, String name, String phone, String contactName) {
        List<CrmLead> result = new ArrayList<>();
        // 1级: 信用代码
        if (StringUtils.hasText(creditCode)) {
            LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
            w.eq(CrmLead::getCreditCode, creditCode);
            result.addAll(leadMapper.selectList(w));
        }
        // 2级: 公司名称
        if (StringUtils.hasText(name)) {
            LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
            w.eq(CrmLead::getCompany, name);
            result.addAll(leadMapper.selectList(w));
        }
        // 3级: 电话
        if (StringUtils.hasText(phone)) {
            LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
            w.eq(CrmLead::getPhone, phone);
            result.addAll(leadMapper.selectList(w));
        }
        // 4级: 联系人姓名
        if (StringUtils.hasText(contactName)) {
            LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
            w.eq(CrmLead::getName, contactName);
            result.addAll(leadMapper.selectList(w));
        }
        if (result.isEmpty()) {
            return Collections.emptyList();
        }
        // 去重
        java.util.LinkedHashMap<Long, CrmLead> distinctMap = new java.util.LinkedHashMap<>();
        for (CrmLead l : result) {
            distinctMap.put(l.getId(), l);
        }
        return distinctMap.values().stream().map(this::safeLeadForCurrentUser).toList();
    }

    @Override
    public DuplicateCheckResult checkDuplicateDetail(String creditCode, String name, String phone, String contactName) {
        // 按优先级逐级命中:P0 信用代码 → P1 公司名称 → P2 电话 → P3 联系人姓名
        CrmLead hit = firstMatch(CrmLead::getCreditCode, creditCode);
        if (hit != null) {
            return buildResult(hit, "P0", "creditCode");
        }
        hit = firstMatch(CrmLead::getCompany, name);
        if (hit != null) {
            return buildResult(hit, "P1", "name");
        }
        hit = firstMatch(CrmLead::getPhone, phone);
        if (hit != null) {
            return buildResult(hit, "P2", "phone");
        }
        hit = firstMatch(CrmLead::getName, contactName);
        if (hit != null) {
            return buildResult(hit, "P3", "contactName");
        }
        return DuplicateCheckResult.none();
    }

    private CrmLead firstMatch(com.baomidou.mybatisplus.core.toolkit.support.SFunction<CrmLead, ?> column, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
        w.eq(column, value).last("LIMIT 1");
        return leadMapper.selectOne(w);
    }

    private DuplicateCheckResult buildResult(CrmLead lead, String level, String field) {
        DuplicateCheckResult r = new DuplicateCheckResult();
        r.setHasDuplicate(true);
        r.setMatchLevel(level);
        r.setMatchField(field);
        if (canViewLeadDetails(lead)) {
            r.setExistingLeadId(lead.getId());
            r.setExistingLeadName(StringUtils.hasText(lead.getCompany()) ? lead.getCompany() : lead.getName());
            r.setExistingOwnerName(dataScopeHelper.resolveUserNames(
                    java.util.Collections.singleton(lead.getOwnerId())).get(lead.getOwnerId()));
        } else {
            r.setExistingLeadName("已存在的私海线索");
            r.setExistingOwnerName("其他销售");
        }
        return r;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockForClaim(Long leadId, Long userId) {
        userId = SecurityUtils.getCurrentUserId();
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (lead.getOwnerId() != null && !lead.getOwnerId().equals(userId)
                && !"pool".equals(lead.getOwnership())) {
            // 记录撞单
            CrmCollisionLog logEntry = new CrmCollisionLog();
            logEntry.setLeadId(leadId);
            logEntry.setLeadName(lead.getName());
            logEntry.setUserAId(lead.getOwnerId());
            logEntry.setUserBId(userId);
            logEntry.setConflictType("claim");
            logEntry.setStatus(0);
            collisionLogMapper.insert(logEntry);
            return false;
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resolveCollision(Long logId, String resolution, String detail) {
        requireManager();
        if (logId == null) {
            throw new BusinessException("撞单记录编号不能为空");
        }
        String normalizedResolution = resolution == null ? "" : resolution.trim();
        String normalizedDetail = detail == null ? "" : detail.trim();
        if (!RESOLUTION_TYPES.contains(normalizedResolution)) {
            throw new BusinessException("仲裁结论不正确");
        }
        if (!StringUtils.hasText(normalizedDetail)) {
            throw new BusinessException("请填写处理说明");
        }
        if (normalizedDetail.length() > 500) {
            throw new BusinessException("处理说明不能超过500个字");
        }
        CrmCollisionLog logEntry = collisionLogMapper.selectById(logId);
        if (logEntry == null) {
            throw new BusinessException("撞单记录不存在");
        }
        assertCollisionVisible(logEntry);
        if (Integer.valueOf(1).equals(logEntry.getStatus())) {
            throw new BusinessException(409, "撞单记录已处理，请勿重复提交");
        }
        UpdateWrapper<CrmCollisionLog> update = new UpdateWrapper<>();
        update.eq("id", logId)
                .eq("status", 0)
                .set("resolution", normalizedResolution)
                .set("resolution_detail", normalizedDetail)
                .set("resolved_by", SecurityUtils.getCurrentUserId())
                .set("resolved_time", LocalDateTime.now())
                .set("status", 1);
        if (collisionLogMapper.update(null, update) != 1) {
            throw new BusinessException(409, "撞单记录状态已变化，请刷新后重试");
        }
    }

    @Override
    public IPage<CrmCollisionLog> getCollisionLogs(int pageNum, int pageSize) {
        requireManager();
        LambdaQueryWrapper<CrmCollisionLog> wrapper = new LambdaQueryWrapper<>();
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        if (visibleIds != null) {
            wrapper.and(w -> w.in(CrmCollisionLog::getUserAId, visibleIds)
                    .or().in(CrmCollisionLog::getUserBId, visibleIds));
        }
        wrapper.orderByDesc(CrmCollisionLog::getCreateTime);
        return collisionLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    private CrmLead safeLeadForCurrentUser(CrmLead lead) {
        if (canViewLeadDetails(lead)) {
            lead.setOwnerName(dataScopeHelper.resolveUserNames(
                    java.util.Collections.singleton(lead.getOwnerId())).get(lead.getOwnerId()));
            return lead;
        }
        CrmLead masked = new CrmLead();
        masked.setCompany("该客资已由其他销售跟进");
        masked.setOwnership("private");
        masked.setOwnerName("其他销售");
        return masked;
    }

    private boolean canViewLeadDetails(CrmLead lead) {
        return lead != null && ("pool".equalsIgnoreCase(lead.getOwnership())
                || dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId()));
    }

    private void requireManager() {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            throw new BusinessException("仅主管、老板或管理员可处理撞单记录");
        }
    }

    private void assertCollisionVisible(CrmCollisionLog logEntry) {
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        if (visibleIds != null && !visibleIds.contains(logEntry.getUserAId())
                && !visibleIds.contains(logEntry.getUserBId())) {
            throw new BusinessException("无权处理数据范围外的撞单记录");
        }
    }
}
