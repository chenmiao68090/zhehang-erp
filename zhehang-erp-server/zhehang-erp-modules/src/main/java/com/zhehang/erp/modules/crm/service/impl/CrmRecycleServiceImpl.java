package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmRecycleRule;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.mapper.CrmRecycleRuleMapper;
import com.zhehang.erp.modules.crm.service.ICrmRecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmRecycleServiceImpl extends ServiceImpl<CrmRecycleRuleMapper, CrmRecycleRule> implements ICrmRecycleService {

    private final CrmRecycleRuleMapper recycleRuleMapper;
    private final CrmLeadMapper leadMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int scanAndRecycle() {
        // 扫描保护期到期且未跟进的私海线索, 释放回公海
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "private")
               .isNotNull(CrmLead::getProtectionExpireDate)
               .le(CrmLead::getProtectionExpireDate, LocalDate.now());
        List<CrmLead> leads = leadMapper.selectList(wrapper);

        int count = 0;
        for (CrmLead lead : leads) {
            lead.setOwnerId(null);
            lead.setOwnership("pool");
            lead.setRecycleCount(lead.getRecycleCount() == null ? 1 : lead.getRecycleCount() + 1);
            lead.setLastRecycleTime(LocalDateTime.now());
            leadMapper.updateById(lead);
            count++;
        }
        log.info("自动扫描回收完成, 回收数量: {}", count);
        return count;
    }

    @Override
    public boolean checkRecycleCondition(Long leadId) {
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            return false;
        }
        if (lead.getProtectionExpireDate() != null && !lead.getProtectionExpireDate().isAfter(LocalDate.now())) {
            return true;
        }
        return false;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int manualRecycle(List<Long> leadIds, String reason) {
        if (leadIds == null || leadIds.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (Long id : leadIds) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            lead.setOwnerId(null);
            lead.setOwnership("pool");
            lead.setRecycleCount(lead.getRecycleCount() == null ? 1 : lead.getRecycleCount() + 1);
            lead.setLastRecycleTime(LocalDateTime.now());
            leadMapper.updateById(lead);
            count++;
        }
        log.info("手动回收完成, 数量: {}, 原因: {}", count, reason);
        return count;
    }

    @Override
    public List<CrmLead> getWarningList(String level) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "private")
               .isNotNull(CrmLead::getRecycleWarningDays);
        switch (level == null ? "" : level) {
            case "green":
                wrapper.ge(CrmLead::getRecycleWarningDays, 7);
                break;
            case "yellow":
                wrapper.between(CrmLead::getRecycleWarningDays, 3, 6);
                break;
            case "red":
                wrapper.le(CrmLead::getRecycleWarningDays, 2);
                break;
            default:
                return Collections.emptyList();
        }
        return leadMapper.selectList(wrapper);
    }

    @Override
    public List<CrmRecycleRule> getRules() {
        LambdaQueryWrapper<CrmRecycleRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(CrmRecycleRule::getPriority).orderByDesc(CrmRecycleRule::getCreateTime);
        return recycleRuleMapper.selectList(wrapper);
    }

    @Override
    public boolean saveRule(CrmRecycleRule rule) {
        if (rule == null) {
            throw new BusinessException("规则不能为空");
        }
        if (rule.getId() == null) {
            return recycleRuleMapper.insert(rule) > 0;
        }
        return recycleRuleMapper.updateById(rule) > 0;
    }

    @SuppressWarnings("unused")
    private void disableExpired(Long ruleId) {
        // 预留: 关闭过期规则
        LambdaUpdateWrapper<CrmRecycleRule> uw = new LambdaUpdateWrapper<>();
        uw.eq(CrmRecycleRule::getId, ruleId).set(CrmRecycleRule::getStatus, 1);
        recycleRuleMapper.update(null, uw);
    }
}
