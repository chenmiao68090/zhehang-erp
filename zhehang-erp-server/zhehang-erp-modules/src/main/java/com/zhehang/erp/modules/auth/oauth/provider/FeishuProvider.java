package com.zhehang.erp.modules.auth.oauth.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * 飞书 OAuth2.0 登录提供者
 *
 * 文档: https://open.feishu.cn/document/common-capabilities/sso/web-application-sso/web-app-overview
 * 1. 构造飞书授权URL -> 用户扫码/点击 -> 回调携带 code
 * 2. 通过 code 换取 user_access_token
 * 3. 通过 user_access_token 获取用户信息
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FeishuProvider implements OAuthProvider {

    private static final String AUTHORIZE_URL = "https://open.feishu.cn/open-apis/authen/v1/authorize";
    private static final String TOKEN_URL = "https://open.feishu.cn/open-apis/authen/v1/oidc/access_token";
    private static final String USER_INFO_URL = "https://open.feishu.cn/open-apis/authen/v1/user_info";

    private final RestTemplate restTemplate;

    @Override
    public String getProvider() {
        return "feishu";
    }

    @Override
    public String buildAuthorizeUrl(String appId, String redirectUri, String state) {
        return AUTHORIZE_URL
                + "?app_id=" + appId
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&state=" + state;
    }

    @Override
    public Map<String, String> getUserInfoByCode(String appId, String appSecret, String code, String agentId) {
        log.info("[飞书] 通过code获取用户信息, appId={}, code={}", appId, code);
        // TODO: 实际部署时替换为真实API调用
        // Step1: POST {TOKEN_URL} body: {grant_type:"authorization_code", code} header: Authorization=Bearer app_access_token
        // Step2: GET {USER_INFO_URL} header: Authorization=Bearer user_access_token

        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("openId", "mock_feishu_" + code);
        userInfo.put("unionId", "mock_union_feishu_" + code);
        userInfo.put("nickname", "飞书用户");
        userInfo.put("avatar", "");
        return userInfo;
    }
}
