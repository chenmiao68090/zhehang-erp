package com.zhehang.erp.security.service;

import com.zhehang.erp.security.domain.LoginUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class TokenService {

    private static final String TOKEN_PREFIX = "Bearer ";
    private static final String HEADER = "Authorization";
    private static final String LOGIN_USER_KEY = "login_user:";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration:7200000}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    private final RedisTemplate<String, Object> redisTemplate;

    public TokenService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Map<String, String> createToken(LoginUser loginUser) {
        String accessUuid = UUID.randomUUID().toString();
        String refreshUuid = UUID.randomUUID().toString();

        // 存储用户信息到Redis
        redisTemplate.opsForValue().set(LOGIN_USER_KEY + accessUuid, loginUser, accessTokenExpiration, TimeUnit.MILLISECONDS);
        redisTemplate.opsForValue().set(LOGIN_USER_KEY + refreshUuid, loginUser, refreshTokenExpiration, TimeUnit.MILLISECONDS);

        // 生成Token
        String accessToken = generateToken(accessUuid, loginUser.getUserId(), accessTokenExpiration);
        String refreshToken = generateToken(refreshUuid, loginUser.getUserId(), refreshTokenExpiration);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        return tokens;
    }

    public LoginUser getLoginUser(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                Claims claims = parseToken(token);
                String uuid = claims.get("uuid", String.class);
                Object obj = redisTemplate.opsForValue().get(LOGIN_USER_KEY + uuid);
                if (obj instanceof LoginUser) {
                    return (LoginUser) obj;
                }
            } catch (Exception e) {
                log.warn("Token解析失败: {}", e.getMessage());
            }
        }
        return null;
    }

    public Map<String, String> refreshToken(String refreshToken) {
        try {
            Claims claims = parseToken(refreshToken);
            String uuid = claims.get("uuid", String.class);
            Object obj = redisTemplate.opsForValue().get(LOGIN_USER_KEY + uuid);
            if (obj instanceof LoginUser loginUser) {
                // 删除旧的refresh token
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
                // 创建新的token对
                return createToken(loginUser);
            }
        } catch (Exception e) {
            log.warn("Refresh Token无效: {}", e.getMessage());
        }
        return null;
    }

    public void removeToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                Claims claims = parseToken(token);
                String uuid = claims.get("uuid", String.class);
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
            } catch (Exception e) {
                log.warn("Token移除失败: {}", e.getMessage());
            }
        }
    }

    private String generateToken(String uuid, Long userId, long expiration) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("uuid", uuid)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        return null;
    }
}
