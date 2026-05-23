package com.zhehang.erp.modules.openapi.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.openapi.domain.entity.OpenapiApp;

public interface IOpenapiAppService extends IService<OpenapiApp> {

    /**
     * 创建应用（自动生成 appKey + appSecret）
     */
    OpenapiApp createApp(OpenapiApp app);

    /**
     * 重置密钥
     */
    String resetSecret(Long appId);

    /**
     * 根据 appKey 获取应用
     */
    OpenapiApp getByAppKey(String appKey);

    /**
     * 启用/禁用
     */
    void changeStatus(Long appId, Integer status);
}
