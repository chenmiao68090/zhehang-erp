package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmFollowService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CrmFollowServiceImpl extends ServiceImpl<CrmFollowMapper, CrmFollow> implements ICrmFollowService {

    private final CrmFollowMapper followMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmLeadMapper leadMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public boolean save(CrmFollow entity) {
        // 线索跟进必须走 /crm/lead/{id}/follow,保证历史、阶段和下一步任务同时更新。
        if (entity != null && entity.getLeadId() != null) {
            throw new BusinessException("请通过线索跟进入口保存,以同步下一步任务");
        }
        // 客户跟进保留旧接口,但仍以后端数据范围校验。
        if (entity != null && entity.getCustomerId() != null) {
            CrmCustomer customer = customerMapper.selectById(entity.getCustomerId());
            if (customer != null && !dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
                throw new BusinessException("无权跟进该客户(不在你的数据范围内)");
            }
        }
        return super.save(entity);
    }

    @Override
    public List<CrmFollow> listByLeadId(Long leadId) {
        // 越权校验:无权访问该线索则不返回其跟进(与写入 save 同口径)
        if (!canAccessLead(leadId)) {
            return java.util.Collections.emptyList();
        }
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getLeadId, leadId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }

    @Override
    public List<CrmFollow> listByCustomerId(Long customerId) {
        if (!canAccessCustomer(customerId)) {
            return java.util.Collections.emptyList();
        }
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getCustomerId, customerId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }

    @Override
    public List<CrmFollow> timeline(Long customerId) {
        if (!canAccessCustomer(customerId)) {
            return java.util.Collections.emptyList();
        }
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getCustomerId, customerId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }

    /** 当前用户能否访问该线索(用于跟进列表越权校验) */
    private boolean canAccessLead(Long leadId) {
        if (leadId == null) {
            return true;
        }
        CrmLead lead = leadMapper.selectById(leadId);
        return lead == null || dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId());
    }

    /** 当前用户能否访问该客户(用于跟进列表越权校验) */
    private boolean canAccessCustomer(Long customerId) {
        if (customerId == null) {
            return true;
        }
        CrmCustomer customer = customerMapper.selectById(customerId);
        return customer == null || dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId());
    }
}
