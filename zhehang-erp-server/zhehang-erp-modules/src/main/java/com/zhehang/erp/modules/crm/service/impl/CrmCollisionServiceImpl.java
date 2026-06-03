package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.dto.DuplicateCheckResult;
import com.zhehang.erp.modules.crm.domain.entity.CrmCollisionLog;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmCollisionLogMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmCollisionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmCollisionServiceImpl extends ServiceImpl<CrmCollisionLogMapper, CrmCollisionLog> implements ICrmCollisionService {

    private final CrmCollisionLogMapper collisionLogMapper;
    private final CrmLeadMapper leadMapper;

    @Override
    public List<CrmLead> checkDuplicate(String creditCode, String name, String phone, String contactName) {
        List<CrmLead> result = new ArrayList<>();
        // 1级: 信用代码
        if (StringUtils.hasText(creditCode)) {
            LambdaQueryWrapper<CrmLead> w = new LambdaQueryWrapper<>();
            w.eq(CrmLead::getCompany, creditCode);
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
        return new ArrayList<>(distinctMap.values());
    }

    @Override
    public DuplicateCheckResult checkDuplicateDetail(String creditCode, String name, String phone, String contactName) {
        // 按优先级逐级命中:P0 信用代码 → P1 公司名称 → P2 电话 → P3 联系人姓名
        CrmLead hit = firstMatch(CrmLead::getCompany, creditCode);
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
        r.setExistingLeadId(lead.getId());
        r.setExistingLeadName(lead.getName());
        r.setExistingOwnerName(lead.getOwnerId() != null ? "用户" + lead.getOwnerId() : null);
        return r;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockForClaim(Long leadId, Long userId) {
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
    public void resolveCollision(Long logId, String resolution) {
        CrmCollisionLog logEntry = collisionLogMapper.selectById(logId);
        if (logEntry == null) {
            throw new BusinessException("撞单记录不存在");
        }
        logEntry.setResolution(resolution);
        logEntry.setResolvedTime(LocalDateTime.now());
        logEntry.setStatus(1);
        collisionLogMapper.updateById(logEntry);
    }

    @Override
    public IPage<CrmCollisionLog> getCollisionLogs(int pageNum, int pageSize) {
        LambdaQueryWrapper<CrmCollisionLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(CrmCollisionLog::getCreateTime);
        return collisionLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }
}
