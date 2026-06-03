package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmDistributeLog;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmDistributeLogMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmDistributeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmDistributeServiceImpl extends ServiceImpl<CrmDistributeLogMapper, CrmDistributeLog> implements ICrmDistributeService {

    private final CrmDistributeLogMapper distributeLogMapper;
    private final CrmLeadMapper leadMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long autoDistribute(Long leadId, Long poolId) {
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        // 加权轮询: 实际项目中应根据团队成员权重选择, 此处简化为保留原 ownerId 或返回 null
        Long candidateUserId = lead.getOwnerId();
        log.info("自动分配线索 leadId={}, poolId={}, 候选userId={}", leadId, poolId, candidateUserId);

        if (candidateUserId != null) {
            lead.setOwnerId(candidateUserId);
            lead.setOwnership("private");
            lead.setClaimTime(LocalDateTime.now());
            leadMapper.updateById(lead);
        }

        CrmDistributeLog distLog = new CrmDistributeLog();
        distLog.setLeadId(leadId);
        distLog.setFromPoolId(poolId);
        distLog.setToUserId(candidateUserId);
        distLog.setDistributeType("auto");
        distributeLogMapper.insert(distLog);
        return candidateUserId;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void manualDistribute(Long leadId, Long toUserId, Long operatorId) {
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        Long fromUserId = lead.getOwnerId();
        lead.setOwnerId(toUserId);
        lead.setOwnership("private");
        lead.setClaimTime(LocalDateTime.now());
        leadMapper.updateById(lead);

        CrmDistributeLog distLog = new CrmDistributeLog();
        distLog.setLeadId(leadId);
        distLog.setFromPoolId(lead.getPoolId());
        distLog.setToUserId(toUserId);
        distLog.setFromUserId(fromUserId);
        distLog.setDistributeType("manual");
        distLog.setRemark("操作人ID:" + operatorId);
        distributeLogMapper.insert(distLog);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean grabLead(Long leadId, Long userId) {
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (lead.getOwnerId() != null && !"pool".equals(lead.getOwnership())) {
            throw new BusinessException("该线索已被领取");
        }
        lead.setOwnerId(userId);
        lead.setOwnership("private");
        lead.setClaimTime(LocalDateTime.now());
        leadMapper.updateById(lead);

        CrmDistributeLog distLog = new CrmDistributeLog();
        distLog.setLeadId(leadId);
        distLog.setFromPoolId(lead.getPoolId());
        distLog.setToUserId(userId);
        distLog.setDistributeType("grab");
        distributeLogMapper.insert(distLog);
        return true;
    }

    @Override
    public int calculateWeight(Long userId) {
        // 简化算法: 默认权重100, 后续可基于持有量/绩效/在线状态等综合计算
        log.debug("计算用户权重 userId={}", userId);
        return 100;
    }

    @Override
    public List<CrmDistributeLog> getDistributeLog(Long leadId) {
        LambdaQueryWrapper<CrmDistributeLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmDistributeLog::getLeadId, leadId)
               .orderByDesc(CrmDistributeLog::getCreateTime);
        return distributeLogMapper.selectList(wrapper);
    }
}
