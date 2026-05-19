package com.zhehang.erp.modules.auth.oauth.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.auth.oauth.domain.entity.SysOauthConfig;
import com.zhehang.erp.modules.auth.oauth.mapper.SysOauthConfigMapper;
import com.zhehang.erp.modules.auth.oauth.service.ISysOauthConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysOauthConfigServiceImpl extends ServiceImpl<SysOauthConfigMapper, SysOauthConfig>
        implements ISysOauthConfigService {

    @Override
    public SysOauthConfig getByProvider(String provider) {
        return lambdaQuery().eq(SysOauthConfig::getProvider, provider).one();
    }

    @Override
    public void saveOrUpdateByProvider(SysOauthConfig config) {
        SysOauthConfig existing = getByProvider(config.getProvider());
        if (existing != null) {
            config.setId(existing.getId());
            updateById(config);
        } else {
            save(config);
        }
    }

    @Override
    public boolean testConnection(String provider) {
        SysOauthConfig config = getByProvider(provider);
        if (config == null || config.getEnabled() == 0) {
            return false;
        }
        // TODO: 真实场景需调用对应第三方接口验证 token 获取能力
        // 当前框架阶段返回配置存在且启用即为可用
        return config.getAppId() != null && !config.getAppId().isEmpty();
    }
}
