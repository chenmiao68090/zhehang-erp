package com.zhehang.erp.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 登录前安全编排：失败限流、风险验证码、首次改密和 TOTP MFA。
 * 任何未完成的挑战都不会创建访问令牌或刷新令牌。
 */
@Service
@RequiredArgsConstructor
public class AccountSecurityService {

    public static final String ACTION_AUTHENTICATED = "AUTHENTICATED";
    public static final String ACTION_REQUIRE_PASSWORD_CHANGE = "REQUIRE_PASSWORD_CHANGE";
    public static final String ACTION_REQUIRE_MFA_ENROLL = "REQUIRE_MFA_ENROLL";
    public static final String ACTION_REQUIRE_MFA = "REQUIRE_MFA";
    public static final String ACTION_LOGIN_AGAIN = "LOGIN_AGAIN";

    private static final String CAPTCHA_KEY = "auth:captcha:";
    private static final String ACCOUNT_FAILURE_KEY = "auth:failure:account:";
    private static final String IP_FAILURE_KEY = "auth:failure:ip:";
    private static final String ACCOUNT_LOCK_KEY = "auth:lock:account:";
    private static final String CHALLENGE_KEY = "auth:challenge:";
    private static final String MFA_PENDING_KEY = "auth:mfa:pending:";
    private static final String CHALLENGE_FAILURE_KEY = "auth:challenge:failure:";
    private static final long CAPTCHA_MINUTES = 3;
    private static final long FAILURE_MINUTES = 15;
    private static final long CHALLENGE_MINUTES = 5;
    private static final int CAPTCHA_THRESHOLD = 2;
    private static final int ACCOUNT_LOCK_THRESHOLD = 5;
    private static final int IP_RATE_LIMIT = 20;
    private static final int CHALLENGE_ATTEMPT_LIMIT = 5;
    private static final String CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final SysUserMapper userMapper;
    private final UserDetailsServiceImpl userDetailsService;
    private final ISysUserService userService;
    private final TokenService tokenService;

    @Value("${account-security.mfa.encryption-key:}")
    private String mfaEncryptionKey;

    public void beforePasswordAuthentication(String username, String ip, String uuid, String code) {
        String accountKey = digestKey(normalizeUsername(username));
        String ipKey = digestKey(normalizeIp(ip));
        if (Boolean.TRUE.equals(redisTemplate.hasKey(ACCOUNT_LOCK_KEY + accountKey))) {
            throw new BusinessException(429, "账号因连续登录失败已短时锁定，请15分钟后再试");
        }
        if (readCounter(IP_FAILURE_KEY + ipKey) >= IP_RATE_LIMIT) {
            throw new BusinessException(429, "当前网络登录尝试过于频繁，请稍后再试");
        }
        if (readCounter(ACCOUNT_FAILURE_KEY + accountKey) >= CAPTCHA_THRESHOLD) {
            validateCaptcha(uuid, code);
        }
    }

    public void recordPasswordFailure(String username, String ip) {
        String accountCounter = ACCOUNT_FAILURE_KEY + digestKey(normalizeUsername(username));
        String ipCounter = IP_FAILURE_KEY + digestKey(normalizeIp(ip));
        long failures = incrementWithExpiry(accountCounter, FAILURE_MINUTES);
        incrementWithExpiry(ipCounter, FAILURE_MINUTES);
        if (failures >= ACCOUNT_LOCK_THRESHOLD) {
            redisTemplate.opsForValue().set(
                    ACCOUNT_LOCK_KEY + digestKey(normalizeUsername(username)),
                    "locked", FAILURE_MINUTES, TimeUnit.MINUTES);
        }
    }

    public void recordPasswordSuccess(String username) {
        String key = digestKey(normalizeUsername(username));
        redisTemplate.delete(List.of(ACCOUNT_FAILURE_KEY + key, ACCOUNT_LOCK_KEY + key));
    }

    public CaptchaChallenge createCaptcha() {
        String uuid = UUID.randomUUID().toString();
        StringBuilder code = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            code.append(CAPTCHA_ALPHABET.charAt(RANDOM.nextInt(CAPTCHA_ALPHABET.length())));
        }
        redisTemplate.opsForValue().set(
                CAPTCHA_KEY + uuid, captchaDigest(uuid, code.toString()), CAPTCHA_MINUTES, TimeUnit.MINUTES);
        return new CaptchaChallenge(uuid, renderCaptcha(code.toString()));
    }

    public Map<String, Object> continueAfterPassword(LoginUser loginUser) {
        SysUser user = requireActiveUser(loginUser.getUserId());
        if (Integer.valueOf(1).equals(user.getMustChangePassword())) {
            return challengeResponse(ACTION_REQUIRE_PASSWORD_CHANGE,
                    createChallenge("PASSWORD_CHANGE", user.getId()), user.getUsername());
        }
        boolean mfaEnabled = Integer.valueOf(1).equals(user.getMfaEnabled())
                && StringUtils.hasText(user.getMfaSecret());
        if (tokenService.requiresMfa(loginUser) && !mfaEnabled) {
            return challengeResponse(ACTION_REQUIRE_MFA_ENROLL,
                    createChallenge("MFA_ENROLL", user.getId()), user.getUsername());
        }
        if (tokenService.isMfaEnforcementEnabled() && mfaEnabled) {
            return challengeResponse(ACTION_REQUIRE_MFA,
                    createChallenge("MFA_VERIFY", user.getId()), user.getUsername());
        }
        return tokenResponse(tokenService.createToken(loginUser));
    }

    public Map<String, Object> changeInitialPassword(String challengeId, String newPassword) {
        Challenge challenge = requireChallenge(challengeId, "PASSWORD_CHANGE");
        userService.updateInitialPassword(challenge.userId(), newPassword);
        deleteChallenge(challengeId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("action", ACTION_LOGIN_AGAIN);
        result.put("message", "密码已更新，请使用新密码重新登录");
        return result;
    }

    public MfaEnrollment startMfaEnrollment(String challengeId) {
        Challenge challenge = requireChallenge(challengeId, "MFA_ENROLL");
        SysUser user = requireActiveUser(challenge.userId());
        String secret = randomBase32Secret();
        redisTemplate.opsForValue().set(
                MFA_PENDING_KEY + challengeId, secret, CHALLENGE_MINUTES, TimeUnit.MINUTES);
        String label = urlEncode("浙杭集团:" + user.getUsername());
        String issuer = urlEncode("浙杭集团");
        String uri = "otpauth://totp/" + label + "?secret=" + secret
                + "&issuer=" + issuer + "&algorithm=SHA1&digits=6&period=30";
        return new MfaEnrollment(secret, uri);
    }

    public Map<String, Object> confirmMfaEnrollment(String challengeId, String code) {
        Challenge challenge = requireChallenge(challengeId, "MFA_ENROLL");
        String secret = redisTemplate.opsForValue().get(MFA_PENDING_KEY + challengeId);
        if (!StringUtils.hasText(secret)) {
            throw new BusinessException(401, "MFA绑定信息已过期，请重新登录");
        }
        if (!verifyTotp(secret, code)) {
            registerChallengeFailure(challengeId);
            throw new BusinessException(400, "动态验证码不正确");
        }
        int updated = userMapper.update(null, new UpdateWrapper<SysUser>()
                .eq("id", challenge.userId())
                .eq("status", 0)
                .set("mfa_enabled", 1)
                .set("mfa_secret", encryptSecret(secret))
                .set("mfa_enrolled_at", LocalDateTime.now()));
        if (updated <= 0) {
            throw new BusinessException(401, "账号状态已变化，请重新登录");
        }
        tokenService.invalidateLoginUserSafely(challenge.userId());
        deleteChallenge(challengeId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("action", ACTION_LOGIN_AGAIN);
        result.put("message", "MFA已启用，请重新登录");
        return result;
    }

    public Map<String, Object> verifyMfa(String challengeId, String code) {
        Challenge challenge = requireChallenge(challengeId, "MFA_VERIFY");
        SysUser user = requireActiveUser(challenge.userId());
        if (!Integer.valueOf(1).equals(user.getMfaEnabled()) || !StringUtils.hasText(user.getMfaSecret())) {
            throw new BusinessException(401, "MFA状态已变化，请重新登录");
        }
        if (!verifyTotp(decryptSecret(user.getMfaSecret()), code)) {
            registerChallengeFailure(challengeId);
            throw new BusinessException(400, "动态验证码不正确");
        }
        deleteChallenge(challengeId);
        LoginUser loginUser = (LoginUser) userDetailsService.loadUserByUsername(user.getUsername());
        loginUser.setMfaVerified(true);
        return tokenResponse(tokenService.createToken(loginUser));
    }

    private Map<String, Object> tokenResponse(Map<String, String> tokens) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("action", ACTION_AUTHENTICATED);
        result.putAll(tokens);
        return result;
    }

    private Map<String, Object> challengeResponse(String action, String challengeId, String username) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("action", action);
        result.put("challengeId", challengeId);
        result.put("username", username);
        result.put("expiresIn", TimeUnit.MINUTES.toSeconds(CHALLENGE_MINUTES));
        return result;
    }

    private String createChallenge(String stage, Long userId) {
        String id = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                CHALLENGE_KEY + id, stage + "|" + userId, CHALLENGE_MINUTES, TimeUnit.MINUTES);
        return id;
    }

    private Challenge requireChallenge(String id, String expectedStage) {
        if (!StringUtils.hasText(id)) {
            throw new BusinessException(401, "登录挑战不存在，请重新登录");
        }
        String raw = redisTemplate.opsForValue().get(CHALLENGE_KEY + id);
        if (!StringUtils.hasText(raw)) {
            throw new BusinessException(401, "登录挑战已过期，请重新登录");
        }
        String[] parts = raw.split("\\|", 2);
        if (parts.length != 2 || !expectedStage.equals(parts[0])) {
            throw new BusinessException(403, "登录挑战类型不匹配");
        }
        try {
            return new Challenge(parts[0], Long.valueOf(parts[1]));
        } catch (NumberFormatException e) {
            deleteChallenge(id);
            throw new BusinessException(401, "登录挑战无效，请重新登录");
        }
    }

    private void deleteChallenge(String id) {
        redisTemplate.delete(List.of(
                CHALLENGE_KEY + id, MFA_PENDING_KEY + id, CHALLENGE_FAILURE_KEY + id));
    }

    private void registerChallengeFailure(String id) {
        long failures = incrementWithExpiry(CHALLENGE_FAILURE_KEY + id, CHALLENGE_MINUTES);
        if (failures >= CHALLENGE_ATTEMPT_LIMIT) {
            deleteChallenge(id);
            throw new BusinessException(429, "验证码连续错误过多，请重新登录");
        }
    }

    private SysUser requireActiveUser(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException(401, "账号不存在或已停用");
        }
        return user;
    }

    private void validateCaptcha(String uuid, String code) {
        if (!StringUtils.hasText(uuid) || !StringUtils.hasText(code)) {
            throw new BusinessException(428, "请输入图形验证码");
        }
        String stored = redisTemplate.opsForValue().getAndDelete(CAPTCHA_KEY + uuid.trim());
        if (!StringUtils.hasText(stored)
                || !MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8),
                captchaDigest(uuid.trim(), code.trim()).getBytes(StandardCharsets.UTF_8))) {
            throw new BusinessException(428, "图形验证码错误或已过期");
        }
    }

    private long incrementWithExpiry(String key, long minutes) {
        Long value = redisTemplate.opsForValue().increment(key);
        if (value != null && value == 1L) {
            redisTemplate.expire(key, minutes, TimeUnit.MINUTES);
        }
        return value == null ? 0L : value;
    }

    private long readCounter(String key) {
        String value = redisTemplate.opsForValue().get(key);
        if (!StringUtils.hasText(value)) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            redisTemplate.delete(key);
            return 0L;
        }
    }

    private String normalizeUsername(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : "<empty>";
    }

    private String normalizeIp(String value) {
        return StringUtils.hasText(value) ? value.trim() : "<unknown>";
    }

    private String digestKey(String value) {
        try {
            return hex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("无法生成登录风控键", e);
        }
    }

    private String captchaDigest(String uuid, String code) {
        return digestKey(uuid + ":" + code.toUpperCase(Locale.ROOT));
    }

    private String renderCaptcha(String code) {
        int width = 132;
        int height = 44;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(new Color(244, 247, 252));
            g.fillRect(0, 0, width, height);
            for (int i = 0; i < 7; i++) {
                g.setColor(new Color(120 + RANDOM.nextInt(80), 140 + RANDOM.nextInt(70), 170 + RANDOM.nextInt(60)));
                g.drawLine(RANDOM.nextInt(width), RANDOM.nextInt(height),
                        RANDOM.nextInt(width), RANDOM.nextInt(height));
            }
            g.setFont(new Font(Font.MONOSPACED, Font.BOLD, 26));
            for (int i = 0; i < code.length(); i++) {
                g.setColor(new Color(20 + RANDOM.nextInt(45), 55 + RANDOM.nextInt(55), 120 + RANDOM.nextInt(65)));
                g.drawString(String.valueOf(code.charAt(i)), 15 + i * 27, 31 + RANDOM.nextInt(5));
            }
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            ImageIO.write(image, "png", output);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray());
        } catch (Exception e) {
            throw new BusinessException(500, "验证码生成失败，请稍后再试");
        } finally {
            g.dispose();
        }
    }

    private String randomBase32Secret() {
        byte[] bytes = new byte[20];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    private boolean verifyTotp(String secret, String code) {
        if (!StringUtils.hasText(secret) || code == null || !code.matches("\\d{6}")) {
            return false;
        }
        long counter = System.currentTimeMillis() / 30_000L;
        for (long offset = -1; offset <= 1; offset++) {
            String expected = totp(secret, counter + offset);
            if (MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII),
                    code.getBytes(StandardCharsets.US_ASCII))) {
                return true;
            }
        }
        return false;
    }

    private String totp(String secret, long counter) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(base32Decode(secret), "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(8).putLong(counter).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return String.format(Locale.ROOT, "%06d", binary % 1_000_000);
        } catch (Exception e) {
            throw new BusinessException(500, "MFA验证服务异常");
        }
    }

    private String encryptSecret(String value) {
        try {
            byte[] iv = new byte[12];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(encryptionKey(), "AES"), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
            return "v1." + encoder.encodeToString(iv) + "." + encoder.encodeToString(encrypted);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(500, "MFA密钥加密失败");
        }
    }

    private String decryptSecret(String value) {
        try {
            String[] parts = value.split("\\.", 3);
            if (parts.length != 3 || !"v1".equals(parts[0])) {
                throw new BusinessException(500, "MFA密钥格式无效，请联系管理员重置MFA");
            }
            Base64.Decoder decoder = Base64.getUrlDecoder();
            byte[] iv = decoder.decode(parts[1]);
            byte[] encrypted = decoder.decode(parts[2]);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(encryptionKey(), "AES"), new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(500, "MFA密钥无法解密，请联系管理员重置MFA");
        }
    }

    private byte[] encryptionKey() {
        if (!StringUtils.hasText(mfaEncryptionKey)) {
            throw new BusinessException(503, "MFA服务尚未配置，请联系系统管理员");
        }
        try {
            byte[] key = Base64.getDecoder().decode(mfaEncryptionKey.trim());
            if (key.length != 32) {
                throw new IllegalArgumentException("key length");
            }
            return key;
        } catch (IllegalArgumentException e) {
            throw new BusinessException(503, "MFA加密密钥配置无效，请联系系统管理员");
        }
    }

    private String base32Encode(byte[] data) {
        StringBuilder output = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsLeft = 0;
        for (byte datum : data) {
            buffer = (buffer << 8) | (datum & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                output.append(BASE32_ALPHABET.charAt((buffer >> (bitsLeft - 5)) & 31));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            output.append(BASE32_ALPHABET.charAt((buffer << (5 - bitsLeft)) & 31));
        }
        return output.toString();
    }

    private byte[] base32Decode(String value) {
        String normalized = value.replace("=", "").replace(" ", "").toUpperCase(Locale.ROOT);
        List<Byte> bytes = new ArrayList<>();
        int buffer = 0;
        int bitsLeft = 0;
        for (char c : normalized.toCharArray()) {
            int index = BASE32_ALPHABET.indexOf(c);
            if (index < 0) {
                throw new BusinessException(500, "MFA密钥格式无效");
            }
            buffer = (buffer << 5) | index;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bytes.add((byte) ((buffer >> (bitsLeft - 8)) & 0xff));
                bitsLeft -= 8;
            }
        }
        byte[] result = new byte[bytes.size()];
        for (int i = 0; i < bytes.size(); i++) {
            result[i] = bytes.get(i);
        }
        return result;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            result.append(String.format(Locale.ROOT, "%02x", value));
        }
        return result.toString();
    }

    public record CaptchaChallenge(String uuid, String image) {
    }

    public record MfaEnrollment(String secret, String otpauthUri) {
    }

    private record Challenge(String stage, Long userId) {
    }
}
