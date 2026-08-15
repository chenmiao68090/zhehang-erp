package com.zhehang.erp.security.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;

/**
 * 生产环境密钥门禁。密钥缺失、仍为占位值或强度不足时拒绝启动，
 * 避免系统在令牌或 MFA 保护失效的状态下对外提供服务。
 */
@Component
@Profile("prod")
public class ProductionSecuritySecretValidator implements InitializingBean {

    private static final int JWT_MIN_BYTES = 32;
    private static final int MFA_KEY_BYTES = 32;

    private final String jwtSecret;
    private final String mfaEncryptionKey;

    public ProductionSecuritySecretValidator(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${account-security.mfa.encryption-key}") String mfaEncryptionKey) {
        this.jwtSecret = jwtSecret;
        this.mfaEncryptionKey = mfaEncryptionKey;
    }

    @Override
    public void afterPropertiesSet() {
        validateJwtSecret(jwtSecret);
        validateMfaEncryptionKey(mfaEncryptionKey);
    }

    public static void validateJwtSecret(String value) {
        if (!StringUtils.hasText(value) || isPlaceholder(value)
                || value.trim().getBytes(StandardCharsets.UTF_8).length < JWT_MIN_BYTES) {
            throw new IllegalStateException("生产 JWT_SECRET 未配置或强度不足，服务拒绝启动");
        }
    }

    public static void validateMfaEncryptionKey(String value) {
        if (!StringUtils.hasText(value) || isPlaceholder(value)) {
            throw new IllegalStateException("生产 MFA_ENCRYPTION_KEY 未配置，服务拒绝启动");
        }
        try {
            byte[] decoded = Base64.getDecoder().decode(value.trim());
            if (decoded.length != MFA_KEY_BYTES) {
                throw new IllegalStateException("生产 MFA_ENCRYPTION_KEY 必须是 Base64 编码的 32 字节随机值");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("生产 MFA_ENCRYPTION_KEY 格式无效，服务拒绝启动", e);
        }
    }

    private static boolean isPlaceholder(String value) {
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.startsWith("change_me")
                || normalized.contains("请改成")
                || normalized.contains("请用_openssl");
    }
}
