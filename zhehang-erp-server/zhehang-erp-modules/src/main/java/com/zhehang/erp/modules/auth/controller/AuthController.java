package com.zhehang.erp.modules.auth.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.LoginService;
import com.zhehang.erp.security.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final LoginService loginService;
    private final TokenService tokenService;
    private final ISysUserService userService;

    @PostMapping("/login")
    public R<Map<String, String>> login(@RequestBody LoginRequest request) {
        Map<String, String> tokens = loginService.login(request.getUsername(), request.getPassword());
        return R.ok(tokens);
    }

    @PostMapping("/register")
    public R<Void> register(@RequestBody RegisterRequest request) {
        long count = userService.lambdaQuery().eq(SysUser::getUsername, request.getUsername()).count();
        if (count > 0) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }
        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(SecurityUtils.encryptPassword(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setStatus(0);
        userService.save(user);
        return R.ok();
    }

    @PostMapping("/refresh")
    public R<Map<String, String>> refresh(@RequestBody RefreshRequest request) {
        Map<String, String> tokens = tokenService.refreshToken(request.getRefreshToken());
        if (tokens == null) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        return R.ok(tokens);
    }

    @PostMapping("/logout")
    public R<Void> logout(HttpServletRequest request) {
        tokenService.removeToken(request);
        return R.ok();
    }

    /**
     * 获取当前登录用户信息（供前端路由守卫调用）
     */
    @GetMapping("/info")
    public R<Map<String, Object>> info(HttpServletRequest request) {
        LoginUser loginUser = tokenService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> user = new HashMap<>();
        user.put("id", loginUser.getUserId());
        user.put("username", loginUser.getUsername());
        user.put("nickname", loginUser.getUsername());
        result.put("user", user);
        result.put("roles", java.util.Collections.singletonList("admin"));
        result.put("permissions", loginUser.getPermissions() == null
                ? java.util.Collections.emptyList()
                : new java.util.ArrayList<>(loginUser.getPermissions()));
        return R.ok(result);
    }

    /**
     * 开发期占位验证码：返回 1x1 透明 PNG。后端登录不强制校验 code。
     */
    @GetMapping(value = "/captcha", produces = "image/png")
    public byte[] captcha() {
        // 1x1 transparent PNG (base64 decoded)
        return new byte[]{
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte)0xC4,
            (byte)0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x78, (byte)0x9C, 0x62, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte)0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte)0xAE,
            0x42, 0x60, (byte)0x82
        };
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
        private String code;
        private String uuid;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String nickname;
    }

    @Data
    public static class RefreshRequest {
        private String refreshToken;
    }
}