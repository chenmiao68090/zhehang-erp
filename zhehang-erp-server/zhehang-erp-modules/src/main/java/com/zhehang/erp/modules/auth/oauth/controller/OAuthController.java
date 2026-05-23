package com.zhehang.erp.modules.auth.oauth.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.auth.oauth.domain.entity.SysOauthConfig;
import com.zhehang.erp.modules.auth.oauth.service.ISysOauthConfigService;
import com.zhehang.erp.modules.auth.oauth.service.OAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "第三方登录管理")
@RestController
@RequestMapping("/auth/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService oAuthService;
    private final ISysOauthConfigService oauthConfigService;

    @Operation(summary = "获取授权URL")
    @GetMapping("/authorize-url")
    public R<String> getAuthorizeUrl(@RequestParam String provider,
                                     @RequestParam(defaultValue = "") String state) {
        String url = oAuthService.getAuthorizeUrl(provider, state);
        return R.ok(url);
    }

    @Operation(summary = "第三方回调处理")
    @GetMapping("/callback/{provider}")
    public R<Map<String, String>> callback(@PathVariable String provider,
                                           @RequestParam String code,
                                           @RequestParam(required = false) String state) {
        Map<String, String> result = oAuthService.handleCallback(provider, code, state);
        return R.ok(result);
    }

    @Operation(summary = "绑定第三方账号")
    @PostMapping("/bind")
    public R<Void> bind(@RequestBody BindRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        oAuthService.bindOAuth(userId, request.getProvider(), request.getCode());
        return R.ok();
    }

    @Operation(summary = "解绑第三方账号")
    @PostMapping("/unbind")
    public R<Void> unbind(@RequestBody UnbindRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        oAuthService.unbindOAuth(userId, request.getProvider());
        return R.ok();
    }

    // ==================== OAuth配置管理 ====================

    @Operation(summary = "获取所有OAuth配置")
    @GetMapping("/config/list")
    public R<List<SysOauthConfig>> configList() {
        return R.ok(oauthConfigService.list());
    }

    @Operation(summary = "获取指定供应商配置")
    @GetMapping("/config/{provider}")
    public R<SysOauthConfig> getConfig(@PathVariable String provider) {
        return R.ok(oauthConfigService.getByProvider(provider));
    }

    @Operation(summary = "保存/更新OAuth配置")
    @PostMapping("/config/save")
    public R<Void> saveConfig(@RequestBody SysOauthConfig config) {
        oauthConfigService.saveOrUpdateByProvider(config);
        return R.ok();
    }

    @Operation(summary = "测试OAuth连接")
    @GetMapping("/config/test/{provider}")
    public R<Boolean> testConnection(@PathVariable String provider) {
        return R.ok(oauthConfigService.testConnection(provider));
    }

    @Data
    public static class BindRequest {
        private String provider;
        private String code;
    }

    @Data
    public static class UnbindRequest {
        private String provider;
    }
}
