package com.zhehang.erp.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AccountSecurityServiceTest {

    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> values;
    @Mock private SysUserMapper userMapper;
    @Mock private UserDetailsServiceImpl userDetailsService;
    @Mock private ISysUserService userService;
    @Mock private TokenService tokenService;

    private final Map<String, String> redis = new HashMap<>();
    private AccountSecurityService service;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(values);
        when(redisTemplate.hasKey(anyString())).thenAnswer(invocation -> redis.containsKey(invocation.getArgument(0)));
        when(values.get(anyString())).thenAnswer(invocation -> redis.get(invocation.getArgument(0)));
        when(values.getAndDelete(anyString())).thenAnswer(invocation -> redis.remove(invocation.getArgument(0)));
        when(values.increment(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            long next = Long.parseLong(redis.getOrDefault(key, "0")) + 1;
            redis.put(key, Long.toString(next));
            return next;
        });
        org.mockito.Mockito.doAnswer(invocation -> {
            redis.put(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(values).set(anyString(), anyString(), org.mockito.ArgumentMatchers.anyLong(), any(TimeUnit.class));
        when(redisTemplate.delete(any(Collection.class))).thenAnswer(invocation -> {
            Collection<String> keys = invocation.getArgument(0);
            long removed = keys.stream().filter(key -> redis.remove(key) != null).count();
            return removed;
        });
        when(redisTemplate.expire(anyString(), org.mockito.ArgumentMatchers.anyLong(), any(TimeUnit.class)))
                .thenReturn(true);
        when(tokenService.requiresMfa(any(LoginUser.class))).thenAnswer(invocation -> {
            LoginUser user = invocation.getArgument(0);
            if (user.isAdmin() || Long.valueOf(1L).equals(user.getUserId())) {
                return true;
            }
            return user.getRoleKeys() != null && user.getRoleKeys().stream()
                    .map(role -> role.contains("__") ? role.substring(0, role.indexOf("__")) : role)
                    .anyMatch(role -> List.of("boss", "super_admin", "finance_hq").contains(role));
        });
        when(tokenService.isMfaEnforcementEnabled()).thenReturn(true);

        service = new AccountSecurityService(
                redisTemplate, userMapper, userDetailsService, userService, tokenService);
        byte[] key = "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.US_ASCII);
        ReflectionTestUtils.setField(service, "mfaEncryptionKey", Base64.getEncoder().encodeToString(key));
    }

    @Test
    void fifthAccountFailureCreatesShortAccountLockAndTracksIpSeparately() {
        for (int i = 0; i < 5; i++) {
            service.recordPasswordFailure("Boss.Account", "203.0.113.8");
        }

        assertThat(redis.keySet()).anyMatch(key -> key.startsWith("auth:lock:account:"));
        assertThat(redis.keySet()).anyMatch(key -> key.startsWith("auth:failure:account:"));
        assertThat(redis.keySet()).anyMatch(key -> key.startsWith("auth:failure:ip:"));
        verify(values).set(
                argThat(key -> key.startsWith("auth:lock:account:")),
                eq("locked"), eq(15L), eq(TimeUnit.MINUTES));
    }

    @Test
    void lockedAccountIsRejectedBeforePasswordAuthentication() {
        service.recordPasswordFailure("locked-user", "203.0.113.10");
        service.recordPasswordFailure("locked-user", "203.0.113.10");
        service.recordPasswordFailure("locked-user", "203.0.113.10");
        service.recordPasswordFailure("locked-user", "203.0.113.10");
        service.recordPasswordFailure("locked-user", "203.0.113.10");

        assertThatThrownBy(() -> service.beforePasswordAuthentication(
                "locked-user", "203.0.113.10", null, null))
                .isInstanceOfSatisfying(BusinessException.class, error -> {
                    assertThat(error.getCode()).isEqualTo(429);
                    assertThat(error.getMessage()).contains("锁定");
                });
    }

    @Test
    void repeatedAccountFailuresRequireRiskCaptcha() {
        service.recordPasswordFailure("risk-user", "203.0.113.11");
        service.recordPasswordFailure("risk-user", "203.0.113.11");

        assertThatThrownBy(() -> service.beforePasswordAuthentication(
                "risk-user", "203.0.113.11", null, null))
                .isInstanceOfSatisfying(BusinessException.class, error -> {
                    assertThat(error.getCode()).isEqualTo(428);
                    assertThat(error.getMessage()).contains("验证码");
                });
    }

    @Test
    void highVolumeIpIsRejectedIndependentlyOfAccount() {
        for (int i = 0; i < 20; i++) {
            service.recordPasswordFailure("different-user-" + i, "203.0.113.12");
        }

        assertThatThrownBy(() -> service.beforePasswordAuthentication(
                "new-account", "203.0.113.12", null, null))
                .isInstanceOfSatisfying(BusinessException.class, error -> {
                    assertThat(error.getCode()).isEqualTo(429);
                    assertThat(error.getMessage()).contains("网络");
                });
    }

    @Test
    void firstLoginPasswordChangePrecedesMfaAndNeverIssuesToken() {
        LoginUser loginUser = loginUser(12L, "new-boss", true, List.of("boss"));
        SysUser user = activeUser(12L, "new-boss");
        user.setMustChangePassword(1);
        when(userMapper.selectById(12L)).thenReturn(user);

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result.get("action")).isEqualTo(AccountSecurityService.ACTION_REQUIRE_PASSWORD_CHANGE);
        assertThat(result.get("challengeId")).isNotNull();
        verify(tokenService, never()).createToken(any(LoginUser.class));
    }

    @Test
    void superAdminWithoutMfaCannotReceiveTokens() {
        LoginUser loginUser = loginUser(15L, "platform-admin", true, List.of("super_admin"));
        when(userMapper.selectById(15L)).thenReturn(activeUser(15L, "platform-admin"));

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result.get("action")).isEqualTo(AccountSecurityService.ACTION_REQUIRE_MFA_ENROLL);
        verify(tokenService, never()).createToken(any(LoginUser.class));
    }

    @Test
    void legacyTenantSuffixedPrivilegedRoleStillRequiresMfa() {
        LoginUser loginUser = loginUser(16L, "legacy-admin", false,
                List.of("super_admin__mr9plur8jyh"));
        when(userMapper.selectById(16L)).thenReturn(activeUser(16L, "legacy-admin"));

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result.get("action")).isEqualTo(AccountSecurityService.ACTION_REQUIRE_MFA_ENROLL);
        verify(tokenService, never()).createToken(any(LoginUser.class));
    }

    @Test
    void ordinaryEmployeeCanAuthenticateWithoutMfa() {
        LoginUser loginUser = loginUser(18L, "employee", false, List.of("staff"));
        when(userMapper.selectById(18L)).thenReturn(activeUser(18L, "employee"));
        when(tokenService.createToken(loginUser)).thenReturn(Map.of(
                "accessToken", "access-token", "refreshToken", "refresh-token"));

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result).containsEntry("action", AccountSecurityService.ACTION_AUTHENTICATED)
                .containsEntry("accessToken", "access-token")
                .containsEntry("refreshToken", "refresh-token");
    }

    @Test
    void temporaryMfaPauseLetsUnboundPrivilegedAccountAuthenticateWithoutEnrollment() {
        LoginUser loginUser = loginUser(19L, "paused-admin", true, List.of("super_admin"));
        when(userMapper.selectById(19L)).thenReturn(activeUser(19L, "paused-admin"));
        when(tokenService.requiresMfa(loginUser)).thenReturn(false);
        when(tokenService.isMfaEnforcementEnabled()).thenReturn(false);
        when(tokenService.createToken(loginUser)).thenReturn(Map.of(
                "accessToken", "paused-access", "refreshToken", "paused-refresh"));

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result).containsEntry("action", AccountSecurityService.ACTION_AUTHENTICATED)
                .containsEntry("accessToken", "paused-access")
                .containsEntry("refreshToken", "paused-refresh");
    }

    @Test
    void temporaryMfaPauseLetsAlreadyBoundAccountAuthenticateWithoutTotp() {
        LoginUser loginUser = loginUser(20L, "paused-bound-admin", true, List.of("super_admin"));
        SysUser user = activeUser(20L, "paused-bound-admin");
        user.setMfaEnabled(1);
        user.setMfaSecret("encrypted-secret-kept-intact");
        when(userMapper.selectById(20L)).thenReturn(user);
        when(tokenService.requiresMfa(loginUser)).thenReturn(false);
        when(tokenService.isMfaEnforcementEnabled()).thenReturn(false);
        when(tokenService.createToken(loginUser)).thenReturn(Map.of(
                "accessToken", "paused-bound-access", "refreshToken", "paused-bound-refresh"));

        Map<String, Object> result = service.continueAfterPassword(loginUser);

        assertThat(result).containsEntry("action", AccountSecurityService.ACTION_AUTHENTICATED)
                .containsEntry("accessToken", "paused-bound-access");
        assertThat(user.getMfaEnabled()).isEqualTo(1);
        assertThat(user.getMfaSecret()).isEqualTo("encrypted-secret-kept-intact");
    }

    @Test
    void initialPasswordChallengeUpdatesPasswordThenRequiresFreshLogin() {
        redis.put("auth:challenge:change-1", "PASSWORD_CHANGE|21");

        Map<String, Object> result = service.changeInitialPassword("change-1", "SecureChange9!");

        verify(userService).updateInitialPassword(21L, "SecureChange9!");
        assertThat(result.get("action")).isEqualTo(AccountSecurityService.ACTION_LOGIN_AGAIN);
        assertThat(redis).doesNotContainKey("auth:challenge:change-1");
        verify(tokenService, never()).createToken(any(LoginUser.class));
    }

    @Test
    void superAdminMfaEnrollmentPersistsEncryptedSecretAndStillRequiresFreshLogin() {
        redis.put("auth:challenge:enroll-1", "MFA_ENROLL|31");
        when(userMapper.selectById(31L)).thenReturn(activeUser(31L, "admin-mfa"));
        AccountSecurityService.MfaEnrollment enrollment = service.startMfaEnrollment("enroll-1");
        String code = ReflectionTestUtils.invokeMethod(service, "totp", enrollment.secret(),
                System.currentTimeMillis() / 30_000L);
        when(userMapper.update(isNull(), any(Wrapper.class))).thenReturn(1);

        Map<String, Object> result = service.confirmMfaEnrollment("enroll-1", code);

        assertThat(enrollment.otpauthUri()).startsWith("otpauth://totp/").contains("issuer=");
        assertThat(result.get("action")).isEqualTo(AccountSecurityService.ACTION_LOGIN_AGAIN);
        verify(userMapper).update(isNull(), any(Wrapper.class));
        verify(tokenService).invalidateLoginUserSafely(31L);
        verify(tokenService, never()).createToken(any(LoginUser.class));
    }

    @Test
    void validMfaChallengeIssuesTokensOnlyAfterTotpVerification() {
        String secret = "JBSWY3DPEHPK3PXP";
        String encrypted = ReflectionTestUtils.invokeMethod(service, "encryptSecret", secret);
        SysUser user = activeUser(41L, "secured-admin");
        user.setMfaEnabled(1);
        user.setMfaSecret(encrypted);
        redis.put("auth:challenge:verify-1", "MFA_VERIFY|41");
        when(userMapper.selectById(41L)).thenReturn(user);
        LoginUser reloaded = loginUser(41L, "secured-admin", true, List.of("super_admin"));
        when(userDetailsService.loadUserByUsername("secured-admin")).thenReturn(reloaded);
        when(tokenService.createToken(reloaded)).thenReturn(Map.of(
                "accessToken", "verified-access", "refreshToken", "verified-refresh"));
        String code = ReflectionTestUtils.invokeMethod(service, "totp", secret,
                System.currentTimeMillis() / 30_000L);

        Map<String, Object> result = service.verifyMfa("verify-1", code);

        assertThat(result).containsEntry("action", AccountSecurityService.ACTION_AUTHENTICATED)
                .containsEntry("accessToken", "verified-access");
        assertThat(reloaded.isMfaVerified()).isTrue();
        verify(tokenService).createToken(reloaded);
        assertThat(redis).doesNotContainKey("auth:challenge:verify-1");
    }

    private SysUser activeUser(Long id, String username) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername(username);
        user.setStatus(0);
        user.setMustChangePassword(0);
        user.setMfaEnabled(0);
        return user;
    }

    private LoginUser loginUser(Long id, String username, boolean admin, List<String> roles) {
        LoginUser user = new LoginUser();
        user.setUserId(id);
        user.setUsername(username);
        user.setAdmin(admin);
        user.setRoleKeys(roles);
        return user;
    }
}
