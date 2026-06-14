package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinCost;
import com.zhehang.erp.modules.finance.mapper.FinCostMapper;
import com.zhehang.erp.modules.finance.service.IFinCostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 管理成本 Service 实现。管理成本属公司整体经营口径,默认按创建人收敛(同其他财务表);
 * 若需财务/管理层看全部,DataScopeHelper 已对 data_scope=1 角色放行全量。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FinCostServiceImpl implements IFinCostService {

    private final FinCostMapper costMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<FinCost> costList(int pageNum, int pageSize,
                                   String keyword, String ownerDept, String period, String status) {
        LambdaQueryWrapper<FinCost> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, FinCost::getCreateBy);
        wrapper.and(StringUtils.hasText(keyword), w -> w
                        .like(FinCost::getCategory, keyword)
                        .or().like(FinCost::getOwnerDept, keyword))
                .eq(StringUtils.hasText(ownerDept), FinCost::getOwnerDept, ownerDept)
                .eq(StringUtils.hasText(period), FinCost::getPeriod, period)
                .eq(StringUtils.hasText(status), FinCost::getStatus, status)
                .orderByDesc(FinCost::getCreateTime);
        return costMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveCost(FinCost entity) {
        if (entity.getId() == null) {
            if (!StringUtils.hasText(entity.getStatus())) {
                entity.setStatus("normal");
            }
            costMapper.insert(entity);
        } else {
            costMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Override
    public void removeCost(Long id) {
        costMapper.deleteById(id);
    }

    @Override
    public void changeStatus(Long id, String status) {
        FinCost entity = costMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException("管理成本记录不存在");
        }
        entity.setStatus(status);
        costMapper.updateById(entity);
    }
}
