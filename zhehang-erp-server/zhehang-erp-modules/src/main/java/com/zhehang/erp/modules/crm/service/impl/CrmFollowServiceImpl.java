package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
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
    private final DataScopeHelper dataScopeHelper;

    @Override
    public boolean save(CrmFollow entity) {
        // 客户跟进越权校验:只能给数据范围内的客户写跟进(线索跟进走 CrmLeadService.addFollow,已校验)
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
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getLeadId, leadId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }

    @Override
    public List<CrmFollow> listByCustomerId(Long customerId) {
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getCustomerId, customerId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }

    @Override
    public List<CrmFollow> timeline(Long customerId) {
        LambdaQueryWrapper<CrmFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmFollow::getCustomerId, customerId)
               .orderByDesc(CrmFollow::getCreateTime);
        return followMapper.selectList(wrapper);
    }
}
