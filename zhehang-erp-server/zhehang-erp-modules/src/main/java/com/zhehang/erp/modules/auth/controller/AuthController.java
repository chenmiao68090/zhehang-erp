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
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String CAPTCHA_KEY_PREFIX = "captcha:";
    private static final long CAPTCHA_EXPIRE_MINUTES = 5L;
    private static final String CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CAPTCHA_LENGTH = 4;
    private static final int IMG_WIDTH = 120;
    private static final int IMG_HEIGHT = 40;

    private final LoginService loginService;
    private final TokenService tokenService;
    private final ISysUserService userService;
    private final RedisTemplate<String, Object> redisTemplate;

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
     * 图形验证码：返回 PNG 图片流，验证码文本存入 Redis（5 分钟过期），
     * UUID 通过响应头 X-Captcha-Uuid 与 Cookie 返回供登录校验使用。
     */
    @GetMapping(value = "/captcha", produces = "image/png")
    public void captcha(HttpServletResponse response) throws IOException {
        Random random = new Random();
        StringBuilder code = new StringBuilder(CAPTCHA_LENGTH);
        for (int i = 0; i < CAPTCHA_LENGTH; i++) {
            code.append(CAPTCHA_CHARS.charAt(random.nextInt(CAPTCHA_CHARS.length())));
        }

        String uuid = UUID.randomUUID().toString().replace("-", "");
        try {
            redisTemplate.opsForValue().set(CAPTCHA_KEY_PREFIX + uuid, code.toString(),
                    CAPTCHA_EXPIRE_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("验证码写入 Redis 失败: {}", e.getMessage());
        }

        BufferedImage image = drawCaptcha(code.toString(), random);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);

        response.setContentType("image/png");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        response.setHeader("X-Captcha-Uuid", uuid);
        response.setHeader("Access-Control-Expose-Headers", "X-Captcha-Uuid");

        Cookie cookie = new Cookie("captcha_uuid", uuid);
        cookie.setPath("/");
        cookie.setHttpOnly(false);
        cookie.setMaxAge((int) TimeUnit.MINUTES.toSeconds(CAPTCHA_EXPIRE_MINUTES));
        response.addCookie(cookie);

        response.getOutputStream().write(baos.toByteArray());
        response.getOutputStream().flush();
    }

    private BufferedImage drawCaptcha(String code, Random random) {
        BufferedImage image = new BufferedImage(IMG_WIDTH, IMG_HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // 背景：浅色渐变填充
        g.setColor(new Color(245, 245, 250));
        g.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

        // 干扰线
        g.setStroke(new BasicStroke(1.2f));
        for (int i = 0; i < 6; i++) {
            g.setColor(randomLightColor(random));
            int x1 = random.nextInt(IMG_WIDTH);
            int y1 = random.nextInt(IMG_HEIGHT);
            int x2 = random.nextInt(IMG_WIDTH);
            int y2 = random.nextInt(IMG_HEIGHT);
            g.drawLine(x1, y1, x2, y2);
        }

        // 噪点
        for (int i = 0; i < 60; i++) {
            g.setColor(randomLightColor(random));
            int x = random.nextInt(IMG_WIDTH);
            int y = random.nextInt(IMG_HEIGHT);
            g.fillOval(x, y, 2, 2);
        }

        // 文本
        Font font = new Font("Arial", Font.BOLD, 26);
        g.setFont(font);
        int charWidth = (IMG_WIDTH - 16) / code.length();
        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            g.setColor(randomDarkColor(random));
            AffineTransform old = g.getTransform();
            double angle = (random.nextDouble() - 0.5) * 0.6;
            int x = 10 + i * charWidth;
            int y = IMG_HEIGHT / 2 + 9 + random.nextInt(5) - 2;
            g.rotate(angle, x, y);
            g.drawString(String.valueOf(c), x, y);
            g.setTransform(old);
        }

        g.dispose();
        return image;
    }

    private Color randomDarkColor(Random random) {
        return new Color(20 + random.nextInt(120), 20 + random.nextInt(120), 20 + random.nextInt(120));
    }

    private Color randomLightColor(Random random) {
        return new Color(160 + random.nextInt(80), 160 + random.nextInt(80), 160 + random.nextInt(80));
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