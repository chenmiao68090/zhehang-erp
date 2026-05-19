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
 * 钉钉 OAuth2.0 登录提供者
 *
 * 文档: https://open.dingtalk.com/document/orgapp/tutorial-obtaining-user-personal-information
 * 1. 构造钉钉授权URL -> 用户扫码 -> 回调携带 authCode
 * 2. 通过 authCode 换取 user access_token
 * 3. 通过 access_token 获取用户信息
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DingtalkProvider implements OAuthProvider {

    private static final String AUTHORIZE_URL = "https://login.dingtalk.com/oauth2/auth";
    private static final String TOKEN_URL = "https://api.dingtalk.com/v1.0/oauth2/userAccessToken";
    private static final String USER_INFO_URL = "https://api.dingtalk.com/v1.0/contact/users/me";

    private final RestTemplate restTemplate;

    @Override
    public String getProvider() {
        return "dingtalk";
    }

    @Override
    public String buildAuthorizeUrl(String appId, String redirectUri, String state) {
        return AUTHORIZE_URL
                + "?client_id=" + appId
                + "&response_type=code"
                + "&scope=openid"
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&state=" + state
                + "&prompt=consent";
    }

    @Override
    public Map<String, String> getUserInfoByCode(String appId, String appSecret, String code, String agentId) {
        log.info("[钉钉] 通过code获取用户信息, appId={}, code={}", appId, code);
        // TODO: 实际部署时替换为真实API调用
        // Step1: POST {TOKEN_URL} body: {clientId, clientSecret, code, grantType:"authorization_code"}
        // Step2: GET {USER_INFO_URL} header: x-acs-dingtalk-access-token={accessToken}

        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("openId", "mock_dingtalk_" + code);
        userInfo.put("unionId", "mock_union_dingtalk_" + code);
        userInfo.put("nickname", "钉钉用户");
        userInfo.put("avatar", "");
        return userInfo;
    }
}
