package com.zhehang.erp.modules.auth.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.LoginService;
import com.zhehang.erp.security.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final LoginService loginService;
    private final TokenService tokenService;
    private final ISysUserService userService;
    private final SysUserMapper userMapper;

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
        SysUser currentUser = userService.getById(loginUser.getUserId());
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(loginUser.getUserId());
        Set<String> roles = new LinkedHashSet<>();
        if (roleKeys != null) {
            roles.addAll(roleKeys);
        }
        if (Long.valueOf(1L).equals(loginUser.getUserId()) || "admin".equals(loginUser.getUsername()) || roles.contains("super_admin")) {
            roles.add("admin");
        }
        if (roles.contains("sys_admin") || roles.contains("dept_manager")) {
            roles.add("manager");
        }
        if (roles.isEmpty()) {
            roles.add("user");
        }
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> user = new HashMap<>();
        user.put("id", loginUser.getUserId());
        user.put("username", loginUser.getUsername());
        user.put("nickname", currentUser != null && currentUser.getNickname() != null ? currentUser.getNickname() : loginUser.getUsername());
        result.put("user", user);
        result.put("roles", new java.util.ArrayList<>(roles));
        result.put("permissions", loginUser.getPermissions() == null
                ? java.util.Collections.emptyList()
                : new java.util.ArrayList<>(loginUser.getPermissions()));
        return R.ok(result);
    }

    /**
     * 开发期验证码：返回可见 PNG。后端登录暂不强制校验 code。
     */
    @GetMapping(value = "/captcha", produces = "image/png")
    public byte[] captcha() {
        int width = 120;
        int height = 40;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(new Color(32, 35, 56));
            g.fillRect(0, 0, width, height);
            g.setColor(new Color(212, 175, 55));
            g.fillRoundRect(4, 4, width - 8, height - 8, 12, 12);
            g.setColor(Color.WHITE);
            g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 18));
            String text = "验证码";
            FontMetrics metrics = g.getFontMetrics();
            int x = (width - metrics.stringWidth(text)) / 2;
            int y = (height - metrics.getHeight()) / 2 + metrics.getAscent();
            g.drawString(text, x, y);
            g.setColor(new Color(255, 255, 255, 50));
            for (int i = 0; i < 6; i++) {
                int x1 = 5 + i * 18;
                int y1 = 5;
                int x2 = x1 + 8;
                int y2 = height - 5;
                g.drawLine(x1, y1, x2, y2);
            }
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", bos);
            return bos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate captcha image", e);
        } finally {
            g.dispose();
        }
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
