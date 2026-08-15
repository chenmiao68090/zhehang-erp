package com.zhehang.erp.security.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.security.ImpersonationPolicy;
import com.zhehang.erp.security.domain.LoginUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class TokenService {

    private static final String TOKEN_PREFIX = "Bearer ";
    private static final String HEADER = "Authorization";
    private static final String IMPERSONATION_TAB_HEADER = "X-Impersonation-Tab-Id";
    private static final String LOGIN_USER_KEY = "login_user:";
    private static final String IMPERSONATION_USER_KEY = "impersonation_login_user:";
    private static final String REFRESH_TOKEN_KEY = "refresh_token:";
    private static final String LEGACY_UPGRADED_SESSION_PREFIX = "legacy:";
    private static final String LEGACY_SESSION_REVOKED = "revoked";
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String SESSION_ID_CLAIM = "session_id";
    private static final String ACTOR_USER_ID_CLAIM = "actor_user_id";
    private static final String EFFECTIVE_USER_ID_CLAIM = "effective_user_id";
    private static final String ACTOR_SESSION_ID_CLAIM = "actor_session_id";
    private static final String TENANT_ID_CLAIM = "tenant_id";
    private static final String TAB_ID_CLAIM = "tab_id";
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";
    private static final String IMPERSONATION_TOKEN_TYPE = "impersonation";
    private static final long IMPERSONATION_EXPIRATION_MILLIS = TimeUnit.MINUTES.toMillis(30);
    private static final String AUTH_VERSION_GLOBAL_KEY = "auth_version:global";
    private static final String AUTH_VERSION_USER_KEY = "auth_version:user:";
    private static final long DEFAULT_AUTH_VERSION = 0L;
    private static final long LEGACY_TOKEN_LIFETIME_TOLERANCE_MILLIS = TimeUnit.MINUTES.toMillis(5);
    private static final int AFTER_COMMIT_INVALIDATION_ATTEMPTS = 3;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration:7200000}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    @Value("${account-security.mfa.required-roles:boss,super_admin,finance_hq}")
    private String requiredMfaRoles;

    /**
     * 登录 MFA 总闸门。默认开启；只允许在短信 MFA 尚未就绪的短期故障窗口显式暂停。
     * 暂停不会删除任何绑定数据，恢复后未带 MFA 证明的会话会重新被拒绝。
     */
    @Value("${account-security.mfa.enforcement-enabled:true}")
    private boolean mfaEnforcementEnabled;

    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    public TokenService(RedisTemplate<String, Object> redisTemplate, StringRedisTemplate stringRedisTemplate) {
        this.redisTemplate = redisTemplate;
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @PostConstruct
    void warnWhenMfaEnforcementIsPaused() {
        if (!mfaEnforcementEnabled) {
            log.warn("SECURITY WARNING: 登录MFA强制已全局暂停；所有账号临时仅使用密码和既有风控，"
                    + "短信MFA验收后必须立即恢复 MFA_ENFORCEMENT_ENABLED=true");
        }
    }

    public Map<String, String> createToken(LoginUser loginUser) {
        if (loginUser == null || loginUser.getUserId() == null || loginUser.isImpersonating()
                || StringUtils.hasText(loginUser.getImpersonationTabId())
                || !loginUser.isAuthVersionBound()) {
            throw new BusinessException(401, "登录权限快照缺失，请重新登录");
        }
        if (!hasRequiredMfaProof(loginUser)) {
            throw new BusinessException(401, "高权限账号必须完成MFA验证，请重新登录");
        }
        if (!isAuthVersionCurrent(loginUser)) {
            throw new BusinessException(401, "账号权限刚刚发生变化，请重新登录");
        }
        return createTokenPair(loginUser);
    }

    /**
     * 在读取角色、菜单和权限前固定版本快照。签发时会再次校验同一快照，
     * 期间发生任何收权都会让本次登录失败，而不是把旧权限绑定到新版本。
     */
    public void captureAuthVersion(LoginUser loginUser) {
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new BusinessException(401, "无法识别登录账号");
        }
        loginUser.setAuthVersion(getCurrentAuthVersion());
        loginUser.setUserAuthVersion(getCurrentUserAuthVersion(loginUser.getUserId()));
        loginUser.setAuthVersionBound(true);
    }

    /**
     * 签发独立、不可刷新的代登录令牌。
     *
     * <p>这里不信任 Controller 传入的“管理员身份”，而是重新校验请求中的原始 typed access
     * token、Redis 稳定会话和固定 userId=3。目标 LoginUser 必须已经按真实登录链加载权限快照，
     * 且密码会在落 Redis 前强制清空。</p>
     */
    public ImpersonationToken createImpersonationToken(HttpServletRequest actorRequest,
                                                        LoginUser effectiveLoginUser,
                                                        String impersonationSessionId) {
        if (!StringUtils.hasText(impersonationSessionId) || impersonationSessionId.length() > 64) {
            throw new BusinessException(400, "代登录会话标识无效");
        }
        if (effectiveLoginUser == null || !isValidTabId(effectiveLoginUser.getImpersonationTabId())) {
            throw new BusinessException(400, "代登录标签页标识无效");
        }
        if (effectiveLoginUser == null || effectiveLoginUser.getUserId() == null
                || effectiveLoginUser.getTenantId() == null || !effectiveLoginUser.isEnabled()
                || effectiveLoginUser.isImpersonating()
                || ImpersonationPolicy.isForbiddenTarget(effectiveLoginUser.getUserId())) {
            throw new BusinessException(403, "目标员工不允许代登录");
        }
        if (!effectiveLoginUser.isAuthVersionBound() || !isAuthVersionCurrent(effectiveLoginUser)) {
            throw new BusinessException(401, "目标员工权限刚刚发生变化，请重试");
        }

        Claims actorClaims = parseRequiredToken(actorRequest);
        if (!isTypedAccessToken(actorClaims)) {
            throw new BusinessException(403, "必须使用超级管理员原始登录态发起代登录");
        }
        String actorSessionId = actorClaims.get(SESSION_ID_CLAIM, String.class);
        Object storedActor = redisTemplate.opsForValue().get(LOGIN_USER_KEY + actorSessionId);
        if (!(storedActor instanceof LoginUser actorLoginUser)
                || actorLoginUser.isImpersonating()
                || !ImpersonationPolicy.isAuthorizedActor(actorLoginUser.getUserId())
                || !isIdentityMatch(actorClaims, actorLoginUser)
                || !hasRequiredMfaProof(actorLoginUser)
                || !isAuthVersionCurrent(actorLoginUser)
                || actorLoginUser.getTenantId() == null
                || !Objects.equals(actorLoginUser.getTenantId(), effectiveLoginUser.getTenantId())) {
            throw new BusinessException(403, "仅平台超级管理员可发起代登录");
        }

        long startTime = System.currentTimeMillis();
        long expireTime = startTime + IMPERSONATION_EXPIRATION_MILLIS;
        effectiveLoginUser.setPassword(null);
        effectiveLoginUser.setActorUserId(actorLoginUser.getUserId());
        effectiveLoginUser.setActorUsername(actorLoginUser.getUsername());
        effectiveLoginUser.setActorSessionId(actorSessionId);
        effectiveLoginUser.setActorUserAuthVersion(actorLoginUser.getUserAuthVersion());
        effectiveLoginUser.setImpersonationSessionId(impersonationSessionId);
        effectiveLoginUser.setImpersonationStartTime(startTime);
        effectiveLoginUser.setImpersonationExpireTime(expireTime);

        if (!Boolean.TRUE.equals(redisTemplate.opsForValue().setIfAbsent(
                IMPERSONATION_USER_KEY + impersonationSessionId,
                effectiveLoginUser,
                IMPERSONATION_EXPIRATION_MILLIS,
                TimeUnit.MILLISECONDS))) {
            throw new BusinessException(409, "代登录会话标识冲突，请重试");
        }
        try {
            String token = generateImpersonationToken(effectiveLoginUser, impersonationSessionId, startTime);
            return new ImpersonationToken(token, startTime, expireTime);
        } catch (RuntimeException e) {
            try {
                revokeImpersonationSession(impersonationSessionId);
            } catch (RuntimeException cleanupFailure) {
                e.addSuppressed(cleanupFailure);
            }
            throw e;
        }
    }

    /**
     * 使用登录态上已经绑定的权限版本签发令牌对。
     *
     * <p>刷新令牌完成版本校验后，权限版本仍可能并发变化。刷新路径必须保留刚刚
     * 校验过的旧版本，不能重新绑定最新版本，否则旧权限登录态会被错误复活。</p>
     */
    private Map<String, String> createTokenPair(LoginUser loginUser) {
        String sessionId = UUID.randomUUID().toString();

        // 一个设备登录只保存一份稳定会话；刷新仅轮换轻量marker，不重写会话。
        redisTemplate.opsForValue().set(
                LOGIN_USER_KEY + sessionId, loginUser, refreshTokenExpiration, TimeUnit.MILLISECONDS);
        return createTokenPairForSession(loginUser, sessionId);
    }

    private Map<String, String> createTokenPairForSession(LoginUser loginUser, String sessionId) {
        String refreshId = UUID.randomUUID().toString();
        stringRedisTemplate.opsForValue().set(
                REFRESH_TOKEN_KEY + refreshId, sessionId, refreshTokenExpiration, TimeUnit.MILLISECONDS);

        String accessToken = generateToken(
                sessionId, sessionId, loginUser.getUserId(), accessTokenExpiration, ACCESS_TOKEN_TYPE);
        String refreshToken = generateToken(
                refreshId, sessionId, loginUser.getUserId(), refreshTokenExpiration, REFRESH_TOKEN_TYPE);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        return tokens;
    }

    public LoginUser getLoginUser(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        LoginUser loginUser = getLoginUser(token);
        if (loginUser != null && loginUser.isImpersonating()) {
            String requestTabId = request != null ? request.getHeader(IMPERSONATION_TAB_HEADER) : null;
            if (!isValidTabId(requestTabId)
                    || !Objects.equals(requestTabId, loginUser.getImpersonationTabId())) {
                log.warn("拒绝跨标签页使用代登录令牌: sessionId={}",
                        loginUser.getImpersonationSessionId());
                return null;
            }
        }
        return loginUser;
    }

    /** WebSocket 票据握手和心跳复用的登录态校验。 */
    public LoginUser getLoginUser(String token) {
        if (StringUtils.hasText(token)) {
            try {
                Claims claims = parseToken(token);
                String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
                if (IMPERSONATION_TOKEN_TYPE.equals(tokenType)) {
                    return getImpersonationLoginUser(claims);
                }
                if (isAccessToken(claims)) {
                    return getStandardLoginUser(claims);
                }
                log.info("拒绝非Access Token进入登录态");
            } catch (Exception e) {
                log.warn("Token解析失败: {}", e.getMessage());
            }
        }
        return null;
    }

    private LoginUser getStandardLoginUser(Claims claims) {
        String uuid = claims.get("uuid", String.class);
        Object obj = redisTemplate.opsForValue().get(LOGIN_USER_KEY + uuid);
        if (obj instanceof LoginUser loginUser) {
            if (!isIdentityMatch(claims, loginUser) || loginUser.isImpersonating()) {
                log.warn("Token用户标识与服务端会话不一致");
                return null;
            }
            if (!hasRequiredMfaProof(loginUser)) {
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
                log.info("高权限登录态缺少MFA验证标记，已失效: userId={}", loginUser.getUserId());
                return null;
            }
            if (isAuthVersionCurrent(loginUser)) {
                return loginUser;
            }
            redisTemplate.delete(LOGIN_USER_KEY + uuid);
            log.info("登录态权限版本已失效: userId={}", loginUser.getUserId());
        }
        return null;
    }

    private LoginUser getImpersonationLoginUser(Claims claims) {
        if (!isImpersonationToken(claims)) {
            return null;
        }
        String sessionId = claims.get(SESSION_ID_CLAIM, String.class);
        Object stored = redisTemplate.opsForValue().get(IMPERSONATION_USER_KEY + sessionId);
        if (!(stored instanceof LoginUser loginUser)
                || !isImpersonationIdentityMatch(claims, loginUser)
                || !isAuthVersionCurrent(loginUser)
                || isImpersonationExpired(loginUser)
                || !isOriginalActorSessionAlive(loginUser)) {
            redisTemplate.delete(IMPERSONATION_USER_KEY + sessionId);
            log.info("代登录态已失效: sessionId={}, effectiveUserId={}",
                    sessionId, loginUserId(stored));
            return null;
        }
        return loginUser;
    }

    public Map<String, String> refreshToken(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return null;
        }
        try {
            Claims claims = parseToken(refreshToken);
            if (!isRefreshToken(claims)) {
                log.info("拒绝非Refresh Token执行刷新");
                return null;
            }
            if (!StringUtils.hasText(claims.get(TOKEN_TYPE_CLAIM, String.class))) {
                return refreshLegacyToken(claims);
            }
            String refreshId = claims.get("uuid", String.class);
            String claimedSessionId = claims.get(SESSION_ID_CLAIM, String.class);
            String sessionId = stringRedisTemplate.opsForValue().getAndDelete(REFRESH_TOKEN_KEY + refreshId);
            if (!StringUtils.hasText(sessionId) || !sessionId.equals(claimedSessionId)) {
                log.info("Refresh Token已被消费或撤销");
                return null;
            }
            String sessionKey = LOGIN_USER_KEY + sessionId;
            Object obj = redisTemplate.opsForValue().get(sessionKey);
            if (obj instanceof LoginUser loginUser) {
                if (!isIdentityMatch(claims, loginUser)) {
                    log.warn("Refresh Token用户标识与服务端会话不一致");
                    return null;
                }
                if (!hasRequiredMfaProof(loginUser)) {
                    redisTemplate.delete(sessionKey);
                    log.info("高权限Refresh Token缺少MFA验证标记: userId={}", loginUser.getUserId());
                    return null;
                }
                if (!isAuthVersionCurrent(loginUser)) {
                    redisTemplate.delete(sessionKey);
                    log.info("Refresh Token权限版本已失效: userId={}", loginUser.getUserId());
                    return null;
                }
                // 仅对仍存在的会话续期，绝不set重建；logout并发删除后expire=false，禁止复活。
                if (!Boolean.TRUE.equals(redisTemplate.expire(
                        sessionKey, refreshTokenExpiration, TimeUnit.MILLISECONDS))) {
                    log.info("Refresh Token所属会话已撤销");
                    return null;
                }
                // 复用稳定sessionId，旧access仍在同一可撤销会话内；refreshId严格单次轮换。
                return createTokenPairForSession(loginUser, sessionId);
            }
        } catch (Exception e) {
            log.warn("Refresh Token无效: {}", e.getMessage());
        }
        return null;
    }

    private Map<String, String> refreshLegacyToken(Claims claims) {
        String uuid = claims.get("uuid", String.class);
        String legacyKey = LOGIN_USER_KEY + uuid;
        Object obj = redisTemplate.opsForValue().getAndDelete(legacyKey);
        if (!(obj instanceof LoginUser loginUser)) {
            return null;
        }
        if (!isIdentityMatch(claims, loginUser)) {
            log.warn("旧Refresh Token用户标识与服务端会话不一致");
            return null;
        }
        if (!hasRequiredMfaProof(loginUser)) {
            log.info("旧高权限Refresh Token缺少MFA验证标记，需重新登录: userId={}", loginUser.getUserId());
            return null;
        }
        if (!loginUser.isAuthVersionBound()) {
            log.info("旧Refresh Token缺少权限版本快照，需重新登录: userId={}", loginUser.getUserId());
            return null;
        }
        if (!isAuthVersionCurrent(loginUser)) {
            log.info("旧Refresh Token权限版本已失效: userId={}", loginUser.getUserId());
            return null;
        }
        // 新会话使用可由旧refresh UUID推导、但与旧login_user键分离的sessionId：
        // 旧JWT只能GETDEL一次；logout仍能定位升级后会话并用墓碑压住并发setIfAbsent。
        String sessionId = legacyUpgradedSessionId(uuid);
        if (!Boolean.TRUE.equals(redisTemplate.opsForValue().setIfAbsent(
                LOGIN_USER_KEY + sessionId, loginUser, refreshTokenExpiration, TimeUnit.MILLISECONDS))) {
            log.info("旧Refresh Token升级期间会话已撤销");
            return null;
        }
        return createTokenPairForSession(loginUser, sessionId);
    }

    public void removeToken(HttpServletRequest request) {
        removeToken(request, null);
    }

    /** 只撤销当前代登录会话，不影响原超级管理员或目标员工的普通登录态。 */
    public void removeImpersonationToken(HttpServletRequest request) {
        LoginUser loginUser = getLoginUser(request);
        if (loginUser == null || !loginUser.isImpersonating()) {
            throw new BusinessException(403, "当前不是代登录会话");
        }
        revokeImpersonationSession(loginUser.getImpersonationSessionId());
    }

    /** start事务后续失败时按已生成的审计会话ID精确补偿撤销。 */
    public void revokeImpersonationSession(String impersonationSessionId) {
        if (StringUtils.hasText(impersonationSessionId)) {
            redisTemplate.delete(IMPERSONATION_USER_KEY + impersonationSessionId);
        }
    }

    /**
     * 撤销当前会话。新令牌对共享稳定sessionId，删除access对应会话即可同时撤销refresh；
     * 可选refreshToken用于清理升级前仍是双UUID的旧会话，避免部署时强制全员退出。
     */
    public void removeToken(HttpServletRequest request, String refreshToken) {
        RuntimeException failure = null;
        try {
            removeTokenValue(getTokenFromRequest(request), null);
        } catch (RuntimeException e) {
            failure = e;
        }
        try {
            removeTokenValue(refreshToken, REFRESH_TOKEN_TYPE);
        } catch (RuntimeException e) {
            if (failure == null) {
                failure = e;
            } else {
                failure.addSuppressed(e);
            }
        }
        if (failure != null) {
            throw failure;
        }
    }

    private void removeTokenValue(String token, String requiredTokenType) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        Claims claims;
        try {
            claims = parseToken(token);
        } catch (Exception e) {
            log.warn("Token移除失败: {}", e.getMessage());
            return;
        }
        if (REFRESH_TOKEN_TYPE.equals(requiredTokenType) && !isRefreshToken(claims)) {
            log.info("忽略退出请求中的非Refresh Token");
            return;
        }
        String uuid = claims.get("uuid", String.class);
        String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
        if (IMPERSONATION_TOKEN_TYPE.equals(tokenType)) {
            if (StringUtils.hasText(uuid)) {
                revokeImpersonationSession(uuid);
            }
        } else if (REFRESH_TOKEN_TYPE.equals(tokenType)) {
            String sessionId = claims.get(SESSION_ID_CLAIM, String.class);
            // 先做语义撤销，再清理marker；marker清理失败时也不能让会话继续可用。
            if (StringUtils.hasText(sessionId)) {
                redisTemplate.delete(LOGIN_USER_KEY + sessionId);
            }
            if (StringUtils.hasText(uuid)) {
                try {
                    stringRedisTemplate.delete(REFRESH_TOKEN_KEY + uuid);
                } catch (Exception e) {
                    log.warn("会话已撤销，但Refresh marker清理失败: refreshId={}", uuid, e);
                }
            }
        } else if (!StringUtils.hasText(tokenType) && isRefreshToken(claims)
                && StringUtils.hasText(uuid)) {
            // 先压住可推导的升级后会话，再删除旧refresh登录态，覆盖所有并发顺序。
            redisTemplate.opsForValue().set(
                    LOGIN_USER_KEY + legacyUpgradedSessionId(uuid),
                    LEGACY_SESSION_REVOKED,
                    getRemainingLifetimeMillis(claims),
                    TimeUnit.MILLISECONDS);
            try {
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
            } catch (Exception e) {
                // 派生会话墓碑已阻止旧refresh升级，旧键仅是可回收残留。
                log.warn("旧Refresh会话已撤销，但旧键清理失败: refreshId={}", uuid, e);
            }
        } else if (StringUtils.hasText(uuid)) {
            // typed access 的uuid就是sessionId；legacy token仍按旧login_user:<uuid>删除。
            redisTemplate.delete(LOGIN_USER_KEY + uuid);
        }
    }

    public void invalidateAllLoginUsers() {
        stringRedisTemplate.opsForValue().increment(AUTH_VERSION_GLOBAL_KEY);
    }

    public void invalidateLoginUser(Long userId) {
        if (userId != null) {
            stringRedisTemplate.opsForValue().increment(AUTH_VERSION_USER_KEY + userId);
        }
    }

    /**
     * 安全敏感变更统一采用两阶段失效：事务内先递增，Redis失败会使业务事务回滚；
     * 提交后再次递增，封住并发登录在未提交旧数据上绑定第一次新版本的窗口。
     */
    public void invalidateLoginUserSafely(Long userId) {
        if (userId == null) {
            return;
        }
        invalidateLoginUser(userId);
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                for (int attempt = 1; attempt <= AFTER_COMMIT_INVALIDATION_ATTEMPTS; attempt++) {
                    try {
                        invalidateLoginUser(userId);
                        return;
                    } catch (Exception e) {
                        if (attempt < AFTER_COMMIT_INVALIDATION_ATTEMPTS) {
                            log.warn("权限提交后二次作废会话失败，立即重试: userId={}, attempt={}",
                                    userId, attempt, e);
                        } else {
                            log.error("权限提交后二次作废会话连续失败，需按 userId 补偿失效: userId={}, attempts={}",
                                    userId, AFTER_COMMIT_INVALIDATION_ATTEMPTS, e);
                        }
                    }
                }
            }
        });
    }

    private boolean isAuthVersionCurrent(LoginUser loginUser) {
        if (loginUser == null || loginUser.getUserId() == null) {
            return false;
        }
        boolean effectiveCurrent = normalizeVersion(loginUser.getAuthVersion()) == getCurrentAuthVersion()
                && normalizeVersion(loginUser.getUserAuthVersion())
                == getCurrentUserAuthVersion(loginUser.getUserId());
        if (!effectiveCurrent || !loginUser.isImpersonating()) {
            return effectiveCurrent;
        }
        Long actorUserId = loginUser.getActorUserId();
        return ImpersonationPolicy.isAuthorizedActor(actorUserId)
                && normalizeVersion(loginUser.getActorUserAuthVersion())
                == getCurrentUserAuthVersion(actorUserId);
    }

    private long getCurrentAuthVersion() {
        return getVersion(AUTH_VERSION_GLOBAL_KEY);
    }

    private long getCurrentUserAuthVersion(Long userId) {
        return getVersion(AUTH_VERSION_USER_KEY + userId);
    }

    private long getVersion(String key) {
        String value = stringRedisTemplate.opsForValue().get(key);
        if (!StringUtils.hasText(value)) {
            return DEFAULT_AUTH_VERSION;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            log.warn("权限版本号格式异常: key={}, value={}", key, value);
            return DEFAULT_AUTH_VERSION;
        }
    }

    private long normalizeVersion(Long version) {
        return version == null ? DEFAULT_AUTH_VERSION : version;
    }

    private String generateToken(String uuid, String sessionId, Long userId, long expiration, String tokenType) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("uuid", uuid)
                .claim(SESSION_ID_CLAIM, sessionId)
                .claim("userId", userId)
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    private String generateImpersonationToken(LoginUser loginUser,
                                              String impersonationSessionId,
                                              long issuedAtMillis) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("uuid", impersonationSessionId)
                .claim(SESSION_ID_CLAIM, impersonationSessionId)
                .claim("userId", loginUser.getUserId())
                .claim(ACTOR_USER_ID_CLAIM, loginUser.getActorUserId())
                .claim(EFFECTIVE_USER_ID_CLAIM, loginUser.getUserId())
                .claim(ACTOR_SESSION_ID_CLAIM, loginUser.getActorSessionId())
                .claim(TENANT_ID_CLAIM, loginUser.getTenantId())
                .claim(TAB_ID_CLAIM, loginUser.getImpersonationTabId())
                .claim(TOKEN_TYPE_CLAIM, IMPERSONATION_TOKEN_TYPE)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date(issuedAtMillis))
                .expiration(new Date(issuedAtMillis + IMPERSONATION_EXPIRATION_MILLIS))
                .signWith(key)
                .compact();
    }

    private boolean isTypedAccessToken(Claims claims) {
        return ACCESS_TOKEN_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM, String.class))
                && isAccessToken(claims);
    }

    private boolean isImpersonationToken(Claims claims) {
        if (claims == null || !IMPERSONATION_TOKEN_TYPE.equals(
                claims.get(TOKEN_TYPE_CLAIM, String.class))) {
            return false;
        }
        String uuid = claims.get("uuid", String.class);
        String sessionId = claims.get(SESSION_ID_CLAIM, String.class);
        return StringUtils.hasText(uuid) && uuid.equals(sessionId);
    }

    private boolean isImpersonationIdentityMatch(Claims claims, LoginUser loginUser) {
        if (loginUser == null || !loginUser.isImpersonating()
                || !isIdentityMatch(claims, loginUser)) {
            return false;
        }
        String sessionId = claims.get(SESSION_ID_CLAIM, String.class);
        String actorSessionId = claims.get(ACTOR_SESSION_ID_CLAIM, String.class);
        String tabId = claims.get(TAB_ID_CLAIM, String.class);
        Long actorUserId = numericClaim(claims, ACTOR_USER_ID_CLAIM);
        Long effectiveUserId = numericClaim(claims, EFFECTIVE_USER_ID_CLAIM);
        Long tenantId = numericClaim(claims, TENANT_ID_CLAIM);
        return Objects.equals(sessionId, loginUser.getImpersonationSessionId())
                && Objects.equals(actorSessionId, loginUser.getActorSessionId())
                && isValidTabId(tabId)
                && Objects.equals(tabId, loginUser.getImpersonationTabId())
                && ImpersonationPolicy.isAuthorizedActor(actorUserId)
                && Objects.equals(actorUserId, loginUser.getActorUserId())
                && Objects.equals(effectiveUserId, loginUser.getUserId())
                && Objects.equals(tenantId, loginUser.getTenantId())
                && !Objects.equals(actorUserId, effectiveUserId);
    }

    private boolean isImpersonationExpired(LoginUser loginUser) {
        Long startTime = loginUser.getImpersonationStartTime();
        Long expireTime = loginUser.getImpersonationExpireTime();
        long now = System.currentTimeMillis();
        return startTime == null || expireTime == null
                || startTime > now
                || expireTime <= now
                || expireTime - startTime != IMPERSONATION_EXPIRATION_MILLIS;
    }

    private boolean isOriginalActorSessionAlive(LoginUser impersonatedUser) {
        if (!StringUtils.hasText(impersonatedUser.getActorSessionId())) {
            return false;
        }
        Object stored = redisTemplate.opsForValue().get(
                LOGIN_USER_KEY + impersonatedUser.getActorSessionId());
        if (!(stored instanceof LoginUser actorLoginUser)
                || actorLoginUser.isImpersonating()
                || !ImpersonationPolicy.isAuthorizedActor(actorLoginUser.getUserId())
                || !hasRequiredMfaProof(actorLoginUser)
                || !Objects.equals(actorLoginUser.getTenantId(), impersonatedUser.getTenantId())
                || !Objects.equals(normalizeVersion(actorLoginUser.getUserAuthVersion()),
                        normalizeVersion(impersonatedUser.getActorUserAuthVersion()))) {
            return false;
        }
        return isAuthVersionCurrent(actorLoginUser);
    }

    /** 统一高权限 MFA 口径，令牌层再次校验，防止部署前旧会话绕过新登录流程。 */
    public boolean requiresMfa(LoginUser loginUser) {
        if (!mfaEnforcementEnabled || loginUser == null) {
            return false;
        }
        if (loginUser.isAdmin() || Long.valueOf(1L).equals(loginUser.getUserId())) {
            return true;
        }
        Set<String> required = configuredMfaRoles();
        return loginUser.getRoleKeys() != null && loginUser.getRoleKeys().stream()
                .map(this::canonicalRoleKey)
                .anyMatch(required::contains);
    }

    public boolean isMfaEnforcementEnabled() {
        return mfaEnforcementEnabled;
    }

    private boolean hasRequiredMfaProof(LoginUser loginUser) {
        return !requiresMfa(loginUser) || loginUser.isMfaVerified();
    }

    private Set<String> configuredMfaRoles() {
        Set<String> roles = new HashSet<>();
        String raw = StringUtils.hasText(requiredMfaRoles)
                ? requiredMfaRoles : "boss,super_admin,finance_hq";
        for (String role : raw.split(",")) {
            if (StringUtils.hasText(role)) {
                roles.add(role.trim());
            }
        }
        if (roles.isEmpty()) {
            roles.addAll(Set.of("boss", "super_admin", "finance_hq"));
        }
        return roles;
    }

    private String canonicalRoleKey(String roleKey) {
        if (!StringUtils.hasText(roleKey)) {
            return "";
        }
        String normalized = roleKey.trim();
        int tenantSuffix = normalized.indexOf("__");
        return tenantSuffix > 0 ? normalized.substring(0, tenantSuffix) : normalized;
    }

    private Long numericClaim(Claims claims, String name) {
        Object value = claims.get(name);
        return value instanceof Number number ? number.longValue() : null;
    }

    private boolean isValidTabId(String tabId) {
        return StringUtils.hasText(tabId)
                && tabId.length() >= 8
                && tabId.length() <= 64
                && tabId.matches("[A-Za-z0-9._-]+");
    }

    private Long loginUserId(Object stored) {
        return stored instanceof LoginUser loginUser ? loginUser.getUserId() : null;
    }

    private boolean isAccessToken(Claims claims) {
        String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
        if (StringUtils.hasText(tokenType)) {
            String uuid = claims.get("uuid", String.class);
            String sessionId = claims.get(SESSION_ID_CLAIM, String.class);
            return ACCESS_TOKEN_TYPE.equals(tokenType)
                    && StringUtils.hasText(uuid)
                    && uuid.equals(sessionId);
        }
        return hasLegacyLifetime(claims, accessTokenExpiration);
    }

    private boolean isRefreshToken(Claims claims) {
        String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
        if (StringUtils.hasText(tokenType)) {
            return REFRESH_TOKEN_TYPE.equals(tokenType);
        }
        return hasLegacyLifetime(claims, refreshTokenExpiration);
    }

    private boolean isIdentityMatch(Claims claims, LoginUser loginUser) {
        Object tokenUserId = claims.get("userId");
        return tokenUserId instanceof Number number
                && loginUser != null
                && loginUser.getUserId() != null
                && loginUser.getUserId().longValue() == number.longValue();
    }

    private long getRemainingLifetimeMillis(Claims claims) {
        Date expiration = claims.getExpiration();
        if (expiration == null) {
            return LEGACY_TOKEN_LIFETIME_TOLERANCE_MILLIS;
        }
        // 覆盖令牌临近过期但请求已进入服务端的极短并发窗口。
        return Math.max(
                LEGACY_TOKEN_LIFETIME_TOLERANCE_MILLIS,
                expiration.getTime() - System.currentTimeMillis());
    }

    private String legacyUpgradedSessionId(String refreshUuid) {
        return LEGACY_UPGRADED_SESSION_PREFIX + refreshUuid;
    }

    /** 部署前签发的JWT没有token_type；仅按其签发时完整寿命识别，兼容而不混用。 */
    private boolean hasLegacyLifetime(Claims claims, long expectedLifetimeMillis) {
        Date issuedAt = claims.getIssuedAt();
        Date expiration = claims.getExpiration();
        if (issuedAt == null || expiration == null || expectedLifetimeMillis <= 0) {
            return false;
        }
        long actualLifetime = expiration.getTime() - issuedAt.getTime();
        return actualLifetime > 0
                && Math.abs(actualLifetime - expectedLifetimeMillis) <= LEGACY_TOKEN_LIFETIME_TOLERANCE_MILLIS;
    }

    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private Claims parseRequiredToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (!StringUtils.hasText(token)) {
            throw new BusinessException(401, "登录已失效");
        }
        try {
            return parseToken(token);
        } catch (Exception e) {
            throw new BusinessException(401, "登录已失效");
        }
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String bearerToken = request.getHeader(HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        return null;
    }

    public record ImpersonationToken(String token, long startTime, long expireTime) { }
}
