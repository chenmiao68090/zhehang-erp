package com.zhehang.erp.modules.auth.oauth.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.auth.oauth.domain.entity.SysOauthConfig;

public interface ISysOauthConfigService extends IService<SysOauthConfig> {

    /**
     * 根据供应商获取配置
     */
    SysOauthConfig getByProvider(String provider);

    /**
     * 保存或更新配置（按provider upsert）
     */
    void saveOrUpdateByProvider(SysOauthConfig config);

    /**
     * 测试连接是否可用
     */
    boolean testConnection(String provider);
}
