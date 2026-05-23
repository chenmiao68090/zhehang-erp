package com.zhehang.erp.modules.acquisition.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseCardVO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseQueryDTO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseStatsVO;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterprise;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterpriseAbnormal;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterpriseContact;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterpriseCrmRecord;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqUnlockRecord;
import com.zhehang.erp.modules.acquisition.mapper.AcqEnterpriseAbnormalMapper;
import com.zhehang.erp.modules.acquisition.mapper.AcqEnterpriseContactMapper;
import com.zhehang.erp.modules.acquisition.mapper.AcqEnterpriseCrmRecordMapper;
import com.zhehang.erp.modules.acquisition.mapper.AcqEnterpriseMapper;
import com.zhehang.erp.modules.acquisition.mapper.AcqUnlockRecordMapper;
import com.zhehang.erp.modules.acquisition.service.IAcqEnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcqEnterpriseServiceImpl extends ServiceImpl<AcqEnterpriseMapper, AcqEnterprise> implements IAcqEnterpriseService {

    private final AcqEnterpriseMapper enterpriseMapper;
    private final AcqEnterpriseAbnormalMapper abnormalMapper;
    private final AcqEnterpriseContactMapper contactMapper;
    private final AcqUnlockRecordMapper unlockRecordMapper;
    private final AcqEnterpriseCrmRecordMapper crmRecordMapper;

    @Override
    public IPage<EnterpriseCardVO> queryEnterprisePage(EnterpriseQueryDTO query) {
        if (query == null) {
            query = new EnterpriseQueryDTO();
        }
        int pageNum = query.getPage() == null ? 1 : query.getPage();
        int pageSize = query.getPageSize() == null ? 20 : query.getPageSize();
        Page<EnterpriseCardVO> page = new Page<>(pageNum, pageSize);

        IPage<EnterpriseCardVO> result = enterpriseMapper.selectEnterprisePage(page, query);
        List<EnterpriseCardVO> records = result.getRecords();
        if (CollectionUtils.isEmpty(records)) {
            return result;
        }

        // 关联异常信息列表
        List<Long> ids = records.stream().map(EnterpriseCardVO::getId).collect(Collectors.toList());
        LambdaQueryWrapper<AcqEnterpriseAbnormal> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(AcqEnterpriseAbnormal::getEnterpriseId, ids)
                .eq(AcqEnterpriseAbnormal::getAbnormalStatus, "active")
                .orderByDesc(AcqEnterpriseAbnormal::getInclusionDate);
        List<AcqEnterpriseAbnormal> abnormals = abnormalMapper.selectList(wrapper);
        Map<Long, List<AcqEnterpriseAbnormal>> abnormalMap = abnormals.stream()
                .collect(Collectors.groupingBy(AcqEnterpriseAbnormal::getEnterpriseId));
        records.forEach(card -> card.setAbnormals(abnormalMap.getOrDefault(card.getId(), java.util.Collections.emptyList())));
        return result;
    }

    @Override
    public EnterpriseStatsVO getStats(EnterpriseQueryDTO query) {
        if (query == null) {
            query = new EnterpriseQueryDTO();
        }
        EnterpriseStatsVO stats = enterpriseMapper.selectStats(query);
        if (stats == null) {
            stats = new EnterpriseStatsVO();
            stats.setTotalCount(0L);
            stats.setTaxAbnormalCount(0L);
            stats.setTaxArrearsCount(0L);
            stats.setMajorViolationCount(0L);
            stats.setTaxPenaltyCount(0L);
            stats.setOperationAbnormalCount(0L);
        }
        return stats;
    }

    @Override
    public AcqEnterprise getDetail(Long id) {
        AcqEnterprise enterprise = enterpriseMapper.selectById(id);
        if (enterprise == null) {
            throw new BusinessException("企业不存在");
        }
        return enterprise;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUnlock(List<Long> enterpriseIds, Long userId) {
        if (CollectionUtils.isEmpty(enterpriseIds)) {
            throw new BusinessException("请选择要解锁的企业");
        }
        LocalDateTime now = LocalDateTime.now();
        for (Long enterpriseId : enterpriseIds) {
            // 查询当前企业未解锁的联系方式
            LambdaQueryWrapper<AcqEnterpriseContact> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(AcqEnterpriseContact::getEnterpriseId, enterpriseId)
                    .eq(AcqEnterpriseContact::getIsUnlocked, 0);
            List<AcqEnterpriseContact> contacts = contactMapper.selectList(wrapper);

            for (AcqEnterpriseContact contact : contacts) {
                contact.setIsUnlocked(1);
                contact.setUnlockTime(now);
                contact.setUnlockBy(userId);
                contactMapper.updateById(contact);

                AcqUnlockRecord record = new AcqUnlockRecord();
                record.setEnterpriseId(enterpriseId);
                record.setContactId(contact.getId());
                record.setUserId(userId);
                record.setCreditCost(1);
                unlockRecordMapper.insert(record);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchAddToCrm(List<Long> enterpriseIds, String crmType, Long userId) {
        if (CollectionUtils.isEmpty(enterpriseIds)) {
            throw new BusinessException("请选择要添加的企业");
        }
        if (!StringUtils.hasText(crmType)) {
            crmType = "lead";
        }
        for (Long enterpriseId : enterpriseIds) {
            AcqEnterpriseCrmRecord record = new AcqEnterpriseCrmRecord();
            record.setEnterpriseId(enterpriseId);
            record.setCrmType(crmType);
            // 暂以企业ID作为CRM记录ID(可扩展为同步创建CRM线索/客户后回填)
            record.setCrmId(enterpriseId);
            record.setUserId(userId);
            crmRecordMapper.insert(record);
        }
    }

    /**
     * 工具方法: 把入参 Map 转成查询 DTO 中的字段(避免空 Map 直接报错)
     * 暂未使用,保留作为扩展。
     */
    @SuppressWarnings("unused")
    private Map<String, Object> safeMap(Map<String, Object> params) {
        return params == null ? new HashMap<>() : params;
    }
}
