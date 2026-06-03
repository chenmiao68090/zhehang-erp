package com.zhehang.erp.modules.auth.oauth.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.auth.oauth.domain.entity.SysOauthConfig;
import com.zhehang.erp.modules.auth.oauth.domain.entity.SysUserOauth;
import com.zhehang.erp.modules.auth.oauth.mapper.SysUserOauthMapper;
import com.zhehang.erp.modules.auth.oauth.provider.OAuthProvider;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
public class OAuthService {

    private final ISysOauthConfigService oauthConfigService;
    private final SysUserOauthMapper userOauthMapper;
    private final ISysUserService userService;
    private final SysUserMapper userMapper;
    private final TokenService tokenService;
    private final Map<String, OAuthProvider> providerMap;

    public OAuthService(ISysOauthConfigService oauthConfigService,
                        SysUserOauthMapper userOauthMapper,
                        ISysUserService userService,
                        SysUserMapper userMapper,
                        TokenService tokenService,
                        List<OAuthProvider> providers) {
        this.oauthConfigService = oauthConfigService;
        this.userOauthMapper = userOauthMapper;
        this.userService = userService;
        this.userMapper = userMapper;
        this.tokenService = tokenService;
        this.providerMap = new HashMap<>();
        for (OAuthProvider provider : providers) {
            this.providerMap.put(provider.getProvider(), provider);
        }
    }

    /**
     * 生成授权URL
     */
    public String getAuthorizeUrl(String provider, String state) {
        SysOauthConfig config = oauthConfigService.getByProvider(provider);
        if (config == null || config.getEnabled() == 0) {
            throw new BusinessException(500, "该第三方登录方式未启用");
        }
        OAuthProvider oAuthProvider = getProvider(provider);
        return oAuthProvider.buildAuthorizeUrl(config.getAppId(), config.getRedirectUri(), state);
    }

    /**
     * 处理第三方回调 -> 登录或创建账户
     */
    @Transactional
    public Map<String, String> handleCallback(String provider, String code, String state) {
        SysOauthConfig config = oauthConfigService.getByProvider(provider);
        if (config == null || config.getEnabled() == 0) {
            throw new BusinessException(500, "该第三方登录方式未启用");
        }

        OAuthProvider oAuthProvider = getProvider(provider);
        Map<String, String> userInfo = oAuthProvider.getUserInfoByCode(
                config.getAppId(), config.getAppSecret(), code, config.getAgentId());

        String openId = userInfo.get("openId");

        // 查找绑定关系
        SysUserOauth binding = findBinding(provider, openId);

        if (binding != null) {
            // 已绑定，直接登录
            SysUser user = userService.getById(binding.getUserId());
            if (user == null) {
                throw new BusinessException(500, "绑定的用户不存在");
            }
            LoginUser loginUser = buildLoginUser(user);
            return tokenService.createToken(loginUser);
        }

        // 未绑定 - 返回提示信息让前端引导绑定/注册
        Map<String, String> result = new HashMap<>();
        result.put("needBind", "true");
        result.put("provider", provider);
        result.put("openId", openId);
        result.put("nickname", userInfo.getOrDefault("nickname", ""));
        result.put("avatar", userInfo.getOrDefault("avatar", ""));
        return result;
    }

    /**
     * 绑定第三方账号到当前用户
     */
    @Transactional
    public void bindOAuth(Long userId, String provider, String code) {
        if (userId == null) {
            throw new BusinessException(401, "请先登录后再绑定第三方账号");
        }
        SysOauthConfig config = oauthConfigService.getByProvider(provider);
        if (config == null) {
            throw new BusinessException(500, "第三方配置不存在");
        }
        SysUser user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException(500, "绑定的用户不存在");
        }
        OAuthProvider oAuthProvider = getProvider(provider);
        Map<String, String> userInfo = oAuthProvider.getUserInfoByCode(
                config.getAppId(), config.getAppSecret(), code, config.getAgentId());

        SysUserOauth binding = new SysUserOauth();
        binding.setUserId(userId);
        binding.setProvider(provider);
        binding.setOpenId(userInfo.get("openId"));
        binding.setUnionId(userInfo.get("unionId"));
        binding.setNickname(userInfo.get("nickname"));
        binding.setAvatar(userInfo.get("avatar"));
        binding.setTenantId(user.getTenantId());
        userOauthMapper.insert(binding);
    }

    /**
     * 解绑第三方账号
     */
    @Transactional
    public void unbindOAuth(Long userId, String provider) {
        if (userId == null) {
            throw new BusinessException(401, "请先登录后再解绑第三方账号");
        }
        userOauthMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUserOauth>()
                        .eq(SysUserOauth::getUserId, userId)
                        .eq(SysUserOauth::getProvider, provider));
    }

    private SysUserOauth findBinding(String provider, String openId) {
        return userOauthMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUserOauth>()
                        .eq(SysUserOauth::getProvider, provider)
                        .eq(SysUserOauth::getOpenId, openId));
    }

    private OAuthProvider getProvider(String provider) {
        OAuthProvider p = providerMap.get(provider);
        if (p == null) {
            throw new BusinessException(500, "不支持的第三方登录类型: " + provider);
        }
        return p;
    }

    private LoginUser buildLoginUser(SysUser user) {
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw new BusinessException(403, "用户已禁用");
        }
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(user.getId());
        loginUser.setUsername(user.getUsername());
        loginUser.setPassword(user.getPassword());
        loginUser.setTenantId(user.getTenantId());
        loginUser.setEnabled(true);

        List<String> perms = userMapper.selectPermsByUserId(user.getId());
        Set<String> permSet = perms == null ? new HashSet<>() : new HashSet<>(perms);
        if (Long.valueOf(1L).equals(user.getId()) || "admin".equals(user.getUsername())) {
            permSet.add("*:*:*");
        }
        loginUser.setPermissions(permSet);
        return loginUser;
    }
}
