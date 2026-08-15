package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;

import java.util.List;

public interface ICrmPoolConfigService extends IService<CrmPoolConfig> {
    List<CrmPoolConfig> listPools();

    CrmPoolConfig getPoolByType(String type);

    boolean createPool(CrmPoolConfig poolConfig);

    boolean updatePool(CrmPoolConfig poolConfig);

    boolean deletePool(Long id);
}
