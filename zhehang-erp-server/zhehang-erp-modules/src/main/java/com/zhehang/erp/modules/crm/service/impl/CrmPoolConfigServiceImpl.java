package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;
import com.zhehang.erp.modules.crm.mapper.CrmPoolConfigMapper;
import com.zhehang.erp.modules.crm.service.ICrmPoolConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmPoolConfigServiceImpl extends ServiceImpl<CrmPoolConfigMapper, CrmPoolConfig> implements ICrmPoolConfigService {

    private final CrmPoolConfigMapper poolConfigMapper;

    @Override
    public List<CrmPoolConfig> listPools() {
        LambdaQueryWrapper<CrmPoolConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmPoolConfig::getStatus, 0)
               .orderByAsc(CrmPoolConfig::getSortOrder);
        return poolConfigMapper.selectList(wrapper);
    }

    @Override
    public CrmPoolConfig getPoolByType(String type) {
        LambdaQueryWrapper<CrmPoolConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmPoolConfig::getPoolType, type).last("LIMIT 1");
        return poolConfigMapper.selectOne(wrapper);
    }

    @Override
    public boolean createPool(CrmPoolConfig poolConfig) {
        if (poolConfig.getStatus() == null) {
            poolConfig.setStatus(0);
        }
        return poolConfigMapper.insert(poolConfig) > 0;
    }

    @Override
    public boolean updatePool(CrmPoolConfig poolConfig) {
        if (poolConfig.getId() == null) {
            throw new BusinessException("公海池ID不能为空");
        }
        return poolConfigMapper.updateById(poolConfig) > 0;
    }

    @Override
    public boolean deletePool(Long id) {
        return poolConfigMapper.deleteById(id) > 0;
    }
}
