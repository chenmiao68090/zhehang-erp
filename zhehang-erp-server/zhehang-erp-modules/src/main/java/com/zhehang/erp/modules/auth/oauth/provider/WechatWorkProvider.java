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
 * 企业微信 OAuth2.0 登录提供者
 *
 * 授权流程文档: https://developer.work.weixin.qq.com/document/path/91022
 * 1. 构造扫码授权链接 -> 用户扫码 -> 回调携带 code
 * 2. 通过 code 换取 access_token + user_ticket
 * 3. 通过 user_ticket 获取用户信息 (userId, name, avatar)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WechatWorkProvider implements OAuthProvider {

    private static final String AUTHORIZE_URL = "https://open.work.weixin.qq.com/wwopen/sso/qrConnect";
    private static final String ACCESS_TOKEN_URL = "https://qyapi.weixin.qq.com/cgi-bin/gettoken";
    private static final String USER_INFO_URL = "https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo";

    private final RestTemplate restTemplate;

    @Override
    public String getProvider() {
        return "wechat_work";
    }

    @Override
    public String buildAuthorizeUrl(String appId, String redirectUri, String state) {
        // 企业微信扫码登录授权URL
        return AUTHORIZE_URL
                + "?appid=" + appId
                + "&agentid=" + "" // agentId 由外层传入
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&state=" + state;
    }

    @Override
    public Map<String, String> getUserInfoByCode(String appId, String appSecret, String code, String agentId) {
        log.info("[企业微信] 通过code获取用户信息, appId={}, code={}", appId, code);
        // TODO: 实际部署时替换为真实API调用
        // Step1: 获取 access_token
        //   GET {ACCESS_TOKEN_URL}?corpid={appId}&corpsecret={appSecret}
        // Step2: 通过 code 获取用户身份
        //   GET {USER_INFO_URL}?access_token={token}&code={code}

        // 当前为框架代码，返回模拟数据用于流程联调
        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("openId", "mock_wechat_work_" + code);
        userInfo.put("unionId", "mock_union_wechat_" + code);
        userInfo.put("nickname", "企微用户");
        userInfo.put("avatar", "");
        return userInfo;
    }
}
