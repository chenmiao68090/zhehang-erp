package com.zhehang.erp.modules.seal.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 刻章客户自助链接票据。
 *
 * <p>仅把票据摘要写入 Redis，原始票据只出现在一次性返回给经办人的安全链接中。
 * 每个链接绑定签发人的租户，24 小时有效，并在一份提单成功落库后失效。</p>
 */
@Service
@RequiredArgsConstructor
public class SealPublicTokenService {

    private static final String TOKEN_PREFIX = "seal:public:token:";
    private static final String SUBMIT_LOCK_PREFIX = "seal:public:submit-lock:";
    private static final Duration TOKEN_TTL = Duration.ofHours(24);
    private static final Duration SUBMIT_LOCK_TTL = Duration.ofMinutes(2);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    private final StringRedisTemplate redisTemplate;

    public IssuedToken issue() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        if (tenantId == null || userId == null) {
            throw new BusinessException(401, "登录已失效，请重新登录后生成客户链接");
        }

        byte[] random = new byte[32];
        SECURE_RANDOM.nextBytes(random);
        String token = HEX.formatHex(random);
        try {
            redisTemplate.opsForValue().set(tokenKey(token), tenantId + ":" + userId,
                    TOKEN_TTL.toSeconds(), TimeUnit.SECONDS);
        } catch (RuntimeException error) {
            throw unavailable(error);
        }
        return new IssuedToken(token, Instant.now().plus(TOKEN_TTL).toEpochMilli());
    }

    public Ticket require(String token) {
        String key = tokenKey(token);
        String value;
        try {
            value = redisTemplate.opsForValue().get(key);
        } catch (RuntimeException error) {
            throw unavailable(error);
        }
        if (!StringUtils.hasText(value)) {
            throw new BusinessException(410, "客户提交链接无效或已过期，请联系经办人重新生成");
        }
        String[] parts = value.split(":", -1);
        if (parts.length != 2) {
            throw new BusinessException(410, "客户提交链接无效或已过期，请联系经办人重新生成");
        }
        try {
            Long tenantId = Long.valueOf(parts[0]);
            Long issuedBy = Long.valueOf(parts[1]);
            if (tenantId <= 0 || issuedBy <= 0) {
                throw new NumberFormatException("non-positive identity");
            }
            return new Ticket(tenantId, issuedBy);
        } catch (NumberFormatException error) {
            throw new BusinessException(410, "客户提交链接无效或已过期，请联系经办人重新生成");
        }
    }

    /** 抢占本票据的提交权，避免双击或并发请求生成重复提单。 */
    public Ticket beginSubmission(String token) {
        String key = lockKey(token);
        Boolean acquired;
        try {
            acquired = redisTemplate.opsForValue().setIfAbsent(key, "1",
                    SUBMIT_LOCK_TTL.toSeconds(), TimeUnit.SECONDS);
        } catch (RuntimeException error) {
            throw unavailable(error);
        }
        if (!Boolean.TRUE.equals(acquired)) {
            throw new BusinessException(409, "资料正在提交，请勿重复操作");
        }
        try {
            // 必须在拿到锁后再读票据：否则慢请求可能先读到票据，等快请求完成删锁后
            // 又重新拿锁并沿用旧 Ticket，导致同一安全链接重复落单。
            return require(token);
        } catch (RuntimeException error) {
            releaseSubmission(token);
            throw error;
        }
    }

    /** 成功落库后让链接立即失效。 */
    public void completeSubmission(String token) {
        List<String> keys = List.of(tokenKey(token), lockKey(token));
        try {
            redisTemplate.delete(keys);
        } catch (RuntimeException error) {
            throw unavailable(error);
        }
    }

    /** 校验或落库失败时只释放并发锁，客户可修正后重试。 */
    public void releaseSubmission(String token) {
        String key = lockKey(token);
        try {
            redisTemplate.delete(key);
        } catch (RuntimeException ignored) {
            // 保留 2 分钟自动过期兜底，不能用清锁失败覆盖原始业务错误。
        }
    }

    private String tokenKey(String token) {
        return TOKEN_PREFIX + digest(token);
    }

    private String lockKey(String token) {
        return SUBMIT_LOCK_PREFIX + digest(token);
    }

    private String digest(String token) {
        if (!StringUtils.hasText(token) || !token.matches("[0-9a-f]{64}")) {
            throw new BusinessException(410, "客户提交链接无效或已过期，请联系经办人重新生成");
        }
        try {
            return HEX.formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 unavailable", error);
        }
    }

    private BusinessException unavailable(RuntimeException cause) {
        BusinessException error = new BusinessException(503, "客户安全链接服务暂不可用，请稍后重试");
        error.initCause(cause);
        return error;
    }

    public record IssuedToken(String token, long expiresAt) {}

    public record Ticket(Long tenantId, Long issuedBy) {}
}
