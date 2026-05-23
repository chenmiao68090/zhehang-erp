package com.zhehang.erp.modules.openapi.service.impl;

import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.openapi.domain.entity.OpenapiApp;
import com.zhehang.erp.modules.openapi.mapper.OpenapiAppMapper;
import com.zhehang.erp.modules.openapi.service.IOpenapiAppService;
import com.zhehang.erp.modules.openapi.util.AesEncryptUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenapiAppServiceImpl extends ServiceImpl<OpenapiAppMapper, OpenapiApp>
        implements IOpenapiAppService {

    @Override
    public OpenapiApp createApp(OpenapiApp app) {
        // 生成 appKey（前缀 + 短UUID）
        String appKey = "zhqf_" + IdUtil.fastSimpleUUID().substring(0, 16);
        String rawSecret = UUID.randomUUID().toString().replace("-", "");

        app.setAppKey(appKey);
        app.setAppSecret(AesEncryptUtils.encrypt(rawSecret));
        if (app.getRateLimit() == null) {
            app.setRateLimit(100);
        }
        if (app.getStatus() == null) {
            app.setStatus(1);
        }
        save(app);

        // 返回时携带明文 secret（仅创建时展示一次）
        app.setAppSecret(rawSecret);
        return app;
    }

    @Override
    public String resetSecret(Long appId) {
        OpenapiApp app = getById(appId);
        if (app == null) {
            throw new BusinessException("应用不存在");
        }
        String rawSecret = UUID.randomUUID().toString().replace("-", "");
        app.setAppSecret(AesEncryptUtils.encrypt(rawSecret));
        updateById(app);
        return rawSecret;
    }

    @Override
    public OpenapiApp getByAppKey(String appKey) {
        return lambdaQuery().eq(OpenapiApp::getAppKey, appKey).one();
    }

    @Override
    public void changeStatus(Long appId, Integer status) {
        OpenapiApp app = new OpenapiApp();
        app.setId(appId);
        app.setStatus(status);
        updateById(app);
    }
}
