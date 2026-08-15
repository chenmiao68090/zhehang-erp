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
        // 管理页必须能看到已禁用项，才能重新启用；status=0 为正常，1 为禁用。
        wrapper.orderByAsc(CrmPoolConfig::getSortOrder);
        return poolConfigMapper.selectList(wrapper);
    }

    @Override
    public CrmPoolConfig getPoolByType(String type) {
        LambdaQueryWrapper<CrmPoolConfig> wrapper = new LambdaQueryWrapper<>();
        // 业务查询只消费启用的公海池配置，禁用项不能继续参与线索筛选。
        wrapper.eq(CrmPoolConfig::getPoolType, type)
               .eq(CrmPoolConfig::getStatus, 0)
               .last("LIMIT 1");
        return poolConfigMapper.selectOne(wrapper);
    }

    @Override
    public boolean createPool(CrmPoolConfig poolConfig) {
        if (poolConfig.getPoolName() == null || poolConfig.getPoolName().isBlank()
                || poolConfig.getPoolType() == null || poolConfig.getPoolType().isBlank()) {
            throw new BusinessException("公海池名称/类型不能为空");
        }
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
