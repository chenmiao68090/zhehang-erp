package com.zhehang.erp.modules.auth.oauth.provider;

import java.util.Map;

/**
 * 第三方OAuth登录提供者接口
 */
public interface OAuthProvider {

    /**
     * 获取供应商标识
     */
    String getProvider();

    /**
     * 生成授权URL
     * @param appId 应用ID
     * @param redirectUri 回调地址
     * @param state 状态码（防CSRF）
     * @return 授权页面URL
     */
    String buildAuthorizeUrl(String appId, String redirectUri, String state);

    /**
     * 通过授权码换取用户信息
     * @param appId 应用ID
     * @param appSecret 应用密钥
     * @param code 授权码
     * @param agentId 代理ID（可选）
     * @return 用户信息 Map，包含 openId, unionId, nickname, avatar
     */
    Map<String, String> getUserInfoByCode(String appId, String appSecret, String code, String agentId);
}
