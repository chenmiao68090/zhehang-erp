package com.zhehang.erp.security.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.security.domain.LoginUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TokenServiceTest {

    private static final String GLOBAL_VERSION_KEY = "auth_version:global";
    private static final String USER_VERSION_KEY_PREFIX = "auth_version:user:";

    @Test
    void newLoginBindsVersionsAndRefreshTokenCannotEnterLoginContext() {
        Fixture fixture = new Fixture();
        fixture.setGlobalVersion(12L);
        fixture.setUserVersion(101L, 34L);

        Map<String, String> tokens = fixture.issueToken(101L);

        LoginUser accessLogin = fixture.service.getLoginUser(tokens.get("accessToken"));
        LoginUser refreshLogin = fixture.service.getLoginUser(tokens.get("refreshToken"));
        assertThat(accessLogin).isNotNull();
        assertThat(refreshLogin).isNull();
        assertThat(accessLogin.getAuthVersion()).isEqualTo(12L);
        assertThat(accessLogin.getUserAuthVersion()).isEqualTo(34L);
        assertThat(fixture.service.refreshToken(tokens.get("accessToken"))).isNull();
        assertThat(fixture.service.getLoginUser(tokens.get("accessToken"))).isNotNull();
    }

    @Test
    void refreshRotatesOnceWhileKeepingAccessInTheSameRevocableSession() {
        Fixture fixture = new Fixture();
        Map<String, String> original = fixture.issueToken(110L);

        Map<String, String> refreshed = fixture.service.refreshToken(original.get("refreshToken"));

        assertThat(refreshed).isNotNull();
        assertThat(fixture.service.getLoginUser(original.get("accessToken"))).isNotNull();
        assertThat(fixture.service.refreshToken(original.get("refreshToken"))).isNull();
        assertThat(fixture.service.getLoginUser(refreshed.get("accessToken"))).isNotNull();
        assertThat(fixture.service.getLoginUser(refreshed.get("refreshToken"))).isNull();
    }

    @Test
    void accessIssuedBeforeRefreshStillRevokesTheRotatedSession() {
        Fixture fixture = new Fixture();
        Map<String, String> original = fixture.issueToken(114L);
        Map<String, String> refreshed = fixture.service.refreshToken(original.get("refreshToken"));

        fixture.service.removeToken(bearer(original.get("accessToken")));

        assertThat(refreshed).isNotNull();
        assertThat(fixture.service.getLoginUser(refreshed.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(refreshed.get("refreshToken"))).isNull();
    }

    @Test
    void logoutBetweenRefreshConsumptionAndExpiryCannotResurrectSession() {
        Fixture fixture = new Fixture();
        Map<String, String> tokens = fixture.issueToken(115L);
        fixture.beforeSessionExpire(() -> fixture.service.removeToken(bearer(tokens.get("accessToken"))));

        Map<String, String> refreshed = fixture.service.refreshToken(tokens.get("refreshToken"));

        assertThat(refreshed).isNull();
        assertThat(fixture.service.getLoginUser(tokens.get("accessToken"))).isNull();
    }

    @Test
    void logoutRevokesAccessAndRefreshForOnlyTheCurrentSession() {
        Fixture fixture = new Fixture();
        Map<String, String> current = fixture.issueToken(111L);
        Map<String, String> anotherDevice = fixture.issueToken(111L);

        fixture.service.removeToken(bearer(current.get("accessToken")), current.get("refreshToken"));

        assertThat(fixture.service.getLoginUser(current.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(current.get("refreshToken"))).isNull();
        assertThat(fixture.service.getLoginUser(anotherDevice.get("accessToken"))).isNotNull();
        assertThat(fixture.service.refreshToken(anotherDevice.get("refreshToken"))).isNotNull();
    }

    @Test
    void semanticSessionDeleteFailurePropagatesInsteadOfReportingLogoutSuccess() {
        Fixture fixture = new Fixture();
        Map<String, String> tokens = fixture.issueToken(121L);
        fixture.failSessionDeletes();

        assertThatThrownBy(() -> fixture.service.removeToken(bearer(tokens.get("accessToken"))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("session delete");
    }

    @Test
    void markerCleanupFailureAfterSessionRevocationDoesNotRestoreSession() {
        Fixture fixture = new Fixture();
        Map<String, String> tokens = fixture.issueToken(122L);
        fixture.failRefreshMarkerDeletes();

        assertThatCode(() -> fixture.service.removeToken(
                bearer(tokens.get("accessToken")), tokens.get("refreshToken")))
                .doesNotThrowAnyException();
        assertThat(fixture.service.getLoginUser(tokens.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(tokens.get("refreshToken"))).isNull();
    }

    @Test
    void legacyRevocationTombstoneFailurePropagatesFromLogout() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyTokenPair(123L);
        fixture.failLegacyTombstoneWrites();

        assertThatThrownBy(() -> fixture.service.removeToken(
                bearer(legacy.get("accessToken")), legacy.get("refreshToken")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("tombstone");
    }

    @Test
    void legacyTokensAreSeparatedByOriginalLifetimeAndUpgradeOnRefresh() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyTokenPair(112L);

        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNotNull();
        assertThat(fixture.service.getLoginUser(legacy.get("refreshToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("accessToken"))).isNull();
        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNotNull();

        Map<String, String> upgraded = fixture.service.refreshToken(legacy.get("refreshToken"));
        assertThat(upgraded).isNotNull();
        assertThat(fixture.service.getLoginUser(upgraded.get("accessToken"))).isNotNull();
        assertThat(fixture.service.getLoginUser(upgraded.get("refreshToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
        assertThat(fixture.service.getLoginUser(upgraded.get("accessToken"))).isNotNull();
    }

    @Test
    void logoutBodyRefreshTokenAlsoCleansLegacyDualUuidSession() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyTokenPair(113L);

        fixture.service.removeToken(bearer(legacy.get("accessToken")), legacy.get("refreshToken"));

        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
    }

    @Test
    void legacyRefreshCannotUpgradeAfterConcurrentLogoutWritesRevocationTombstone() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyTokenPair(116L);
        fixture.beforeLegacyUpgradeSet(() -> fixture.service.removeToken(
                bearer(legacy.get("accessToken")), legacy.get("refreshToken")));

        Map<String, String> upgraded = fixture.service.refreshToken(legacy.get("refreshToken"));

        assertThat(upgraded).isNull();
        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
    }

    @Test
    void legacyRefreshWithoutBoundAuthorizationSnapshotMustRelogin() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyTokenPair(120L, false);

        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNotNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
    }

    @Test
    void unknownTypeBrokenSessionOrMismatchedUserFailsClosed() {
        Fixture fixture = new Fixture();

        assertThat(fixture.service.getLoginUser(
                fixture.issueCustomAccess(117L, 117L, "ACCESS", true))).isNull();
        assertThat(fixture.service.getLoginUser(
                fixture.issueCustomAccess(118L, 118L, "access", false))).isNull();
        assertThat(fixture.service.getLoginUser(
                fixture.issueCustomAccess(119L, 999L, "access", true))).isNull();
    }

    @Test
    void tokenIssuanceRejectsIdentityWithoutAPreloadedVersionSnapshot() {
        Fixture fixture = new Fixture();

        assertThatThrownBy(() -> fixture.service.createToken(loginUser(102L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("权限快照缺失");
    }

    @Test
    void versionChangeAfterIdentityLoadRejectsTokenIssuance() {
        Fixture fixture = new Fixture();
        fixture.setGlobalVersion(6L);
        fixture.setUserVersion(103L, 9L);
        LoginUser loginUser = loginUser(103L);
        fixture.service.captureAuthVersion(loginUser);

        fixture.setUserVersion(103L, 10L);

        assertThatThrownBy(() -> fixture.service.createToken(loginUser))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("权限刚刚发生变化");
    }

    @Test
    void privilegedSessionWithoutMfaProofCannotBeIssuedOrReused() {
        Fixture fixture = new Fixture();
        LoginUser privileged = loginUser(1L);
        privileged.setAdmin(true);
        privileged.setRoleKeys(java.util.List.of("super_admin"));
        fixture.service.captureAuthVersion(privileged);

        assertThatThrownBy(() -> fixture.service.createToken(privileged))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("MFA");

        privileged.setMfaVerified(true);
        Map<String, String> tokens = fixture.service.createToken(privileged);
        assertThat(fixture.service.getLoginUser(tokens.get("accessToken"))).isNotNull();
    }

    @Test
    void temporaryMfaPauseAllowsPrivilegedIssueReuseAndRefreshWithoutProof() {
        Fixture fixture = new Fixture();
        ReflectionTestUtils.setField(fixture.service, "mfaEnforcementEnabled", false);
        LoginUser privileged = loginUser(1L);
        privileged.setAdmin(true);
        privileged.setRoleKeys(java.util.List.of("super_admin"));
        fixture.service.captureAuthVersion(privileged);

        Map<String, String> tokens = fixture.service.createToken(privileged);

        assertThat(fixture.service.getLoginUser(tokens.get("accessToken"))).isNotNull();
        Map<String, String> refreshed = fixture.service.refreshToken(tokens.get("refreshToken"));
        assertThat(refreshed).isNotNull();
        assertThat(fixture.service.getLoginUser(refreshed.get("accessToken"))).isNotNull();
    }

    @Test
    void restoringMfaEnforcementRejectsSessionsIssuedWithoutProofDuringPause() {
        Fixture fixture = new Fixture();
        ReflectionTestUtils.setField(fixture.service, "mfaEnforcementEnabled", false);

        LoginUser accessAccount = loginUser(1L);
        accessAccount.setAdmin(true);
        accessAccount.setRoleKeys(java.util.List.of("super_admin"));
        fixture.service.captureAuthVersion(accessAccount);
        Map<String, String> accessTokens = fixture.service.createToken(accessAccount);

        LoginUser refreshAccount = loginUser(3L);
        refreshAccount.setAdmin(true);
        refreshAccount.setRoleKeys(java.util.List.of("super_admin"));
        fixture.service.captureAuthVersion(refreshAccount);
        Map<String, String> refreshTokens = fixture.service.createToken(refreshAccount);

        ReflectionTestUtils.setField(fixture.service, "mfaEnforcementEnabled", true);

        assertThat(fixture.service.getLoginUser(accessTokens.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(refreshTokens.get("refreshToken"))).isNull();
    }

    @Test
    void restoringMfaEnforcementRejectsUnverifiedActorAndItsImpersonationSession() {
        Fixture fixture = new Fixture();
        ReflectionTestUtils.setField(fixture.service, "mfaEnforcementEnabled", false);
        LoginUser actor = loginUser(3L);
        actor.setAdmin(true);
        actor.setRoleKeys(java.util.List.of("super_admin"));
        fixture.service.captureAuthVersion(actor);
        Map<String, String> actorTokens = fixture.service.createToken(actor);
        TokenService.ImpersonationToken impersonation = fixture.issueImpersonation(
                actorTokens.get("accessToken"), 704L, "imp-issued-during-mfa-pause");

        ReflectionTestUtils.setField(fixture.service, "mfaEnforcementEnabled", true);

        assertThat(fixture.service.getLoginUser(impersonation.token())).isNull();
        assertThat(fixture.service.getLoginUser(actorTokens.get("accessToken"))).isNull();
    }

    @Test
    void legacyPrivilegedSessionWithoutMfaProofIsRejectedAfterUpgrade() {
        Fixture fixture = new Fixture();
        Map<String, String> legacy = fixture.issueLegacyPrivilegedTokenPair(1L, false);

        assertThat(fixture.service.getLoginUser(legacy.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(legacy.get("refreshToken"))).isNull();
    }

    @Test
    void safeInvalidationInsideTransactionRunsBeforeCommitAndAgainAfterCommit() {
        Fixture fixture = new Fixture();
        fixture.setUserVersion(104L, 20L);
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            fixture.service.invalidateLoginUserSafely(104L);

            assertThat(fixture.getUserVersion(104L)).isEqualTo(21L);
            assertThat(TransactionSynchronizationManager.getSynchronizations()).hasSize(1);

            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(TransactionSynchronization::afterCommit);

            assertThat(fixture.getUserVersion(104L)).isEqualTo(22L);
        } finally {
            TransactionSynchronizationManager.setActualTransactionActive(false);
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void afterCommitRetriesTwiceThenCompletesSecondInvalidationWithoutThrowing() {
        Fixture fixture = new Fixture();
        fixture.setUserVersion(105L, 30L);
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            fixture.service.invalidateLoginUserSafely(105L);
            assertThat(fixture.getUserVersion(105L)).isEqualTo(31L);

            fixture.failNextUserVersionIncrements(105L, 2);
            assertThatCode(() -> TransactionSynchronizationManager.getSynchronizations()
                    .forEach(TransactionSynchronization::afterCommit))
                    .doesNotThrowAnyException();

            assertThat(fixture.getUserVersion(105L)).isEqualTo(32L);
        } finally {
            TransactionSynchronizationManager.setActualTransactionActive(false);
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void refreshKeepsVerifiedVersionsWhenGlobalVersionChangesAfterCheck() {
        Fixture fixture = new Fixture();
        fixture.setGlobalVersion(4L);
        fixture.setUserVersion(201L, 7L);
        Map<String, String> original = fixture.issueToken(201L);

        fixture.afterVersionRead(key -> {
            if ((USER_VERSION_KEY_PREFIX + 201L).equals(key)) {
                fixture.setGlobalVersion(5L);
                fixture.afterVersionRead(null);
            }
        });
        Map<String, String> refreshed = fixture.service.refreshToken(original.get("refreshToken"));

        assertThat(refreshed).isNotNull();
        assertThat(fixture.service.getLoginUser(refreshed.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(refreshed.get("refreshToken"))).isNull();
    }

    @Test
    void userVersionRaceInvalidatesRefreshedPairWithoutAffectingAnotherUser() {
        Fixture fixture = new Fixture();
        fixture.setGlobalVersion(2L);
        fixture.setUserVersion(301L, 8L);
        fixture.setUserVersion(302L, 15L);
        Map<String, String> affected = fixture.issueToken(301L);
        Map<String, String> unrelated = fixture.issueToken(302L);

        fixture.afterVersionRead(key -> {
            if ((USER_VERSION_KEY_PREFIX + 301L).equals(key)) {
                fixture.setUserVersion(301L, 9L);
                fixture.afterVersionRead(null);
            }
        });
        Map<String, String> refreshedAffected =
                fixture.service.refreshToken(affected.get("refreshToken"));

        assertThat(refreshedAffected).isNotNull();
        assertThat(fixture.service.getLoginUser(refreshedAffected.get("accessToken"))).isNull();
        assertThat(fixture.service.refreshToken(refreshedAffected.get("refreshToken"))).isNull();
        assertThat(fixture.service.getLoginUser(unrelated.get("accessToken"))).isNotNull();
        assertThat(fixture.service.refreshToken(unrelated.get("refreshToken"))).isNotNull();
    }

    @Test
    void impersonationUsesEffectiveIdentityCannotRefreshAndRevokesWithoutTouchingActor() {
        Fixture fixture = new Fixture();
        fixture.setUserVersion(3L, 3L);
        fixture.setUserVersion(701L, 8L);
        Map<String, String> actorTokens = fixture.issueToken(3L);
        LoginUser target = loginUser(701L);
        target.setPassword("must-not-enter-impersonation-session");
        target.setImpersonationTabId("tab-impersonation-701");
        fixture.service.captureAuthVersion(target);

        TokenService.ImpersonationToken issued = fixture.service.createImpersonationToken(
                bearer(actorTokens.get("accessToken")), target, "imp-session-701");

        LoginUser effective = fixture.service.getLoginUser(issued.token());
        assertThat(effective).isNotNull();
        assertThat(effective.getUserId()).isEqualTo(701L);
        assertThat(effective.getActorUserId()).isEqualTo(3L);
        assertThat(effective.getTenantId()).isEqualTo(1L);
        assertThat(effective.getPassword()).isNull();
        assertThat(effective.isImpersonating()).isTrue();
        assertThat(effective.getImpersonationSessionId()).isEqualTo("imp-session-701");
        assertThat(issued.expireTime() - issued.startTime())
                .isEqualTo(TimeUnit.MINUTES.toMillis(30));
        assertThat(fixture.service.refreshToken(issued.token())).isNull();

        assertThat(fixture.service.getLoginUser(
                impersonationBearer(issued.token(), "tab-impersonation-701"))).isNotNull();
        assertThat(fixture.service.getLoginUser(
                impersonationBearer(issued.token(), "another-browser-tab"))).isNull();
        fixture.service.removeImpersonationToken(
                impersonationBearer(issued.token(), "tab-impersonation-701"));

        assertThat(fixture.service.getLoginUser(issued.token())).isNull();
        assertThat(fixture.service.getLoginUser(actorTokens.get("accessToken"))).isNotNull();
        assertThat(fixture.service.refreshToken(actorTokens.get("refreshToken"))).isNotNull();
    }

    @Test
    void onlyFixedOwnerActorCanCreateImpersonationAndProtectedTargetsStayForbidden() {
        Fixture fixture = new Fixture();
        Map<String, String> ordinaryAdminByRole = fixture.issueToken(2L);
        Map<String, String> platformRoot = fixture.issuePrivilegedToken(1L);
        LoginUser target = loginUser(702L);
        target.setImpersonationTabId("tab-impersonation-702");
        fixture.service.captureAuthVersion(target);

        assertThatThrownBy(() -> fixture.service.createImpersonationToken(
                bearer(ordinaryAdminByRole.get("accessToken")), target, "imp-denied"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("平台超级管理员");
        assertThatThrownBy(() -> fixture.service.createImpersonationToken(
                bearer(platformRoot.get("accessToken")), target, "root-denied"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("平台超级管理员");

        Map<String, String> owner = fixture.issueToken(3L);
        target.setImpersonationSessionId("already-impersonating");
        assertThatThrownBy(() -> fixture.service.createImpersonationToken(
                bearer(owner.get("accessToken")), target, "nested-denied"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("目标员工不允许");

        for (long protectedTargetId : new long[]{1L, 3L}) {
            LoginUser protectedTarget = loginUser(protectedTargetId);
            protectedTarget.setImpersonationTabId("tab-protected-" + protectedTargetId);
            fixture.service.captureAuthVersion(protectedTarget);
            assertThatThrownBy(() -> fixture.service.createImpersonationToken(
                    bearer(owner.get("accessToken")), protectedTarget,
                    "protected-" + protectedTargetId))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("目标员工不允许");
        }
    }

    @Test
    void actorOrTargetRevocationAndServerSideExpiryInvalidateImpersonation() {
        Fixture fixture = new Fixture();
        fixture.setUserVersion(3L, 11L);
        fixture.setUserVersion(703L, 21L);
        Map<String, String> actorTokens = fixture.issueToken(3L);

        TokenService.ImpersonationToken actorBound = fixture.issueImpersonation(
                actorTokens.get("accessToken"), 703L, "imp-actor-bound");
        fixture.service.removeToken(bearer(actorTokens.get("accessToken")));
        assertThat(fixture.service.getLoginUser(actorBound.token())).isNull();

        Map<String, String> secondActorSession = fixture.issueToken(3L);
        TokenService.ImpersonationToken targetBound = fixture.issueImpersonation(
                secondActorSession.get("accessToken"), 703L, "imp-target-bound");
        fixture.service.invalidateLoginUser(703L);
        assertThat(fixture.service.getLoginUser(targetBound.token())).isNull();
        assertThat(fixture.service.getLoginUser(secondActorSession.get("accessToken"))).isNotNull();

        fixture.setUserVersion(703L, 22L);
        TokenService.ImpersonationToken expiring = fixture.issueImpersonation(
                secondActorSession.get("accessToken"), 703L, "imp-expired");
        fixture.expireImpersonation("imp-expired");
        assertThat(fixture.service.getLoginUser(expiring.token())).isNull();
    }

    @Test
    void forgedImpersonationClaimsFailClosed() {
        Fixture fixture = new Fixture();
        Map<String, String> actorTokens = fixture.issueToken(3L);
        TokenService.ImpersonationToken issued = fixture.issueImpersonation(
                actorTokens.get("accessToken"), 704L, "imp-forgery");
        LoginUser stored = fixture.service.getLoginUser(issued.token());

        String forged = fixture.forgeImpersonationToken(
                "imp-forgery", 3L, 999L, stored.getActorSessionId(), 1L,
                stored.getImpersonationTabId());

        assertThat(fixture.service.getLoginUser(forged)).isNull();
    }

    private static LoginUser loginUser(Long userId) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("user-" + userId);
        loginUser.setTenantId(1L);
        loginUser.setEnabled(true);
        return loginUser;
    }

    private static MockHttpServletRequest bearer(String token) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        return request;
    }

    private static MockHttpServletRequest impersonationBearer(String token, String tabId) {
        MockHttpServletRequest request = bearer(token);
        request.addHeader("X-Impersonation-Tab-Id", tabId);
        return request;
    }

    private static final class Fixture {

        private static final String SECRET =
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        private final Map<String, Object> loginSessions = new HashMap<>();
        private final Map<String, String> authVersions = new HashMap<>();
        private final Map<String, String> refreshMarkers = new HashMap<>();
        private final Map<String, Integer> incrementFailuresRemaining = new HashMap<>();
        private Consumer<String> afterVersionRead;
        private Runnable beforeSessionExpire;
        private Runnable beforeLegacyUpgradeSet;
        private boolean sessionDeletesFail;
        private boolean refreshMarkerDeletesFail;
        private boolean legacyTombstoneWritesFail;
        private final TokenService service;

        @SuppressWarnings("unchecked")
        private Fixture() {
            RedisTemplate<String, Object> redisTemplate = mock(RedisTemplate.class);
            ValueOperations<String, Object> loginOperations = mock(ValueOperations.class);
            when(redisTemplate.opsForValue()).thenReturn(loginOperations);
            when(loginOperations.get(anyString()))
                    .thenAnswer(invocation -> loginSessions.get(invocation.getArgument(0)));
            when(loginOperations.getAndDelete(anyString()))
                    .thenAnswer(invocation -> loginSessions.remove(invocation.getArgument(0)));
            doAnswer(invocation -> {
                String key = invocation.getArgument(0);
                Object value = invocation.getArgument(1);
                if (legacyTombstoneWritesFail && value instanceof String) {
                    throw new IllegalStateException("simulated tombstone write failure");
                }
                loginSessions.put(key, value instanceof LoginUser loginUser ? copy(loginUser) : value);
                return null;
            }).when(loginOperations).set(anyString(), any(), anyLong(), eq(TimeUnit.MILLISECONDS));
            when(loginOperations.setIfAbsent(anyString(), any(), anyLong(), eq(TimeUnit.MILLISECONDS)))
                    .thenAnswer(invocation -> {
                        Runnable hook = beforeLegacyUpgradeSet;
                        beforeLegacyUpgradeSet = null;
                        if (hook != null) {
                            hook.run();
                        }
                        String key = invocation.getArgument(0);
                        if (loginSessions.containsKey(key)) {
                            return false;
                        }
                        Object value = invocation.getArgument(1);
                        loginSessions.put(key, value instanceof LoginUser loginUser ? copy(loginUser) : value);
                        return true;
                    });
            when(redisTemplate.delete(anyString()))
                    .thenAnswer(invocation -> {
                        if (sessionDeletesFail) {
                            throw new IllegalStateException("simulated session delete failure");
                        }
                        return loginSessions.remove(invocation.getArgument(0)) != null;
                    });
            when(redisTemplate.expire(anyString(), anyLong(), eq(TimeUnit.MILLISECONDS)))
                    .thenAnswer(invocation -> {
                        Runnable hook = beforeSessionExpire;
                        beforeSessionExpire = null;
                        if (hook != null) {
                            hook.run();
                        }
                        return loginSessions.containsKey(invocation.getArgument(0));
                    });

            StringRedisTemplate stringRedisTemplate = mock(StringRedisTemplate.class);
            ValueOperations<String, String> versionOperations = mock(ValueOperations.class);
            when(stringRedisTemplate.opsForValue()).thenReturn(versionOperations);
            when(versionOperations.get(anyString())).thenAnswer(invocation -> {
                String key = invocation.getArgument(0);
                String version = authVersions.get(key);
                Consumer<String> hook = afterVersionRead;
                if (hook != null) {
                    hook.accept(key);
                }
                return version;
            });
            doAnswer(invocation -> {
                refreshMarkers.put(invocation.getArgument(0), invocation.getArgument(1));
                return null;
            }).when(versionOperations).set(anyString(), anyString(), anyLong(), eq(TimeUnit.MILLISECONDS));
            when(versionOperations.getAndDelete(anyString()))
                    .thenAnswer(invocation -> refreshMarkers.remove(invocation.getArgument(0)));
            when(stringRedisTemplate.delete(anyString()))
                    .thenAnswer(invocation -> {
                        if (refreshMarkerDeletesFail) {
                            throw new IllegalStateException("simulated marker delete failure");
                        }
                        return refreshMarkers.remove(invocation.getArgument(0)) != null;
                    });
            when(versionOperations.increment(anyString())).thenAnswer(invocation -> {
                String key = invocation.getArgument(0);
                int remainingFailures = incrementFailuresRemaining.getOrDefault(key, 0);
                if (remainingFailures > 0) {
                    incrementFailuresRemaining.put(key, remainingFailures - 1);
                    throw new IllegalStateException("simulated redis increment failure");
                }
                long current = Long.parseLong(authVersions.getOrDefault(key, "0"));
                long next = current + 1L;
                authVersions.put(key, String.valueOf(next));
                return next;
            });

            service = new TokenService(redisTemplate, stringRedisTemplate);
            ReflectionTestUtils.setField(service, "secret", SECRET);
            ReflectionTestUtils.setField(service, "accessTokenExpiration", TimeUnit.HOURS.toMillis(2));
            ReflectionTestUtils.setField(service, "refreshTokenExpiration", TimeUnit.DAYS.toMillis(7));
            ReflectionTestUtils.setField(service, "requiredMfaRoles", "boss,super_admin,finance_hq");
            ReflectionTestUtils.setField(service, "mfaEnforcementEnabled", true);
        }

        private void setGlobalVersion(long version) {
            authVersions.put(GLOBAL_VERSION_KEY, String.valueOf(version));
        }

        private void setUserVersion(long userId, long version) {
            authVersions.put(USER_VERSION_KEY_PREFIX + userId, String.valueOf(version));
        }

        private long getUserVersion(long userId) {
            return Long.parseLong(authVersions.getOrDefault(USER_VERSION_KEY_PREFIX + userId, "0"));
        }

        private void failNextUserVersionIncrements(long userId, int attempts) {
            incrementFailuresRemaining.put(USER_VERSION_KEY_PREFIX + userId, attempts);
        }

        private void afterVersionRead(Consumer<String> hook) {
            afterVersionRead = hook;
        }

        private void beforeSessionExpire(Runnable hook) {
            beforeSessionExpire = hook;
        }

        private void beforeLegacyUpgradeSet(Runnable hook) {
            beforeLegacyUpgradeSet = hook;
        }

        private void failSessionDeletes() {
            sessionDeletesFail = true;
        }

        private void failRefreshMarkerDeletes() {
            refreshMarkerDeletesFail = true;
        }

        private void failLegacyTombstoneWrites() {
            legacyTombstoneWritesFail = true;
        }

        private Map<String, String> issueToken(long userId) {
            LoginUser loginUser = loginUser(userId);
            service.captureAuthVersion(loginUser);
            return service.createToken(loginUser);
        }

        private Map<String, String> issuePrivilegedToken(long userId) {
            LoginUser loginUser = loginUser(userId);
            loginUser.setAdmin(true);
            loginUser.setRoleKeys(java.util.List.of("super_admin"));
            loginUser.setMfaVerified(true);
            service.captureAuthVersion(loginUser);
            return service.createToken(loginUser);
        }

        private TokenService.ImpersonationToken issueImpersonation(String actorAccessToken,
                                                                   long effectiveUserId,
                                                                   String sessionId) {
            LoginUser target = loginUser(effectiveUserId);
            target.setImpersonationTabId("tab-" + sessionId);
            service.captureAuthVersion(target);
            return service.createImpersonationToken(bearer(actorAccessToken), target, sessionId);
        }

        private void expireImpersonation(String sessionId) {
            Object stored = loginSessions.get("impersonation_login_user:" + sessionId);
            if (stored instanceof LoginUser loginUser) {
                loginUser.setImpersonationExpireTime(System.currentTimeMillis() - 1L);
            }
        }

        private String forgeImpersonationToken(String sessionId,
                                               long actorUserId,
                                               long effectiveUserId,
                                               String actorSessionId,
                                               long tenantId,
                                               String tabId) {
            Date issuedAt = new Date();
            return Jwts.builder()
                    .claim("uuid", sessionId)
                    .claim("session_id", sessionId)
                    .claim("userId", effectiveUserId)
                    .claim("actor_user_id", actorUserId)
                    .claim("effective_user_id", effectiveUserId)
                    .claim("actor_session_id", actorSessionId)
                    .claim("tenant_id", tenantId)
                    .claim("tab_id", tabId)
                    .claim("token_type", "impersonation")
                    .issuedAt(issuedAt)
                    .expiration(new Date(issuedAt.getTime() + TimeUnit.MINUTES.toMillis(30)))
                    .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                    .compact();
        }

        private Map<String, String> issueLegacyTokenPair(long userId) {
            return issueLegacyTokenPair(userId, true);
        }

        private Map<String, String> issueLegacyTokenPair(long userId, boolean bindAuthVersion) {
            LoginUser loginUser = loginUser(userId);
            if (bindAuthVersion) {
                service.captureAuthVersion(loginUser);
            }
            String accessUuid = UUID.randomUUID().toString();
            String refreshUuid = UUID.randomUUID().toString();
            loginSessions.put("login_user:" + accessUuid, copy(loginUser));
            loginSessions.put("login_user:" + refreshUuid, copy(loginUser));
            return Map.of(
                    "accessToken", legacyToken(accessUuid, userId, TimeUnit.HOURS.toMillis(2)),
                    "refreshToken", legacyToken(refreshUuid, userId, TimeUnit.DAYS.toMillis(7)));
        }

        private Map<String, String> issueLegacyPrivilegedTokenPair(long userId, boolean mfaVerified) {
            LoginUser loginUser = loginUser(userId);
            loginUser.setAdmin(true);
            loginUser.setRoleKeys(java.util.List.of("super_admin__tenant"));
            loginUser.setMfaVerified(mfaVerified);
            service.captureAuthVersion(loginUser);
            String accessUuid = UUID.randomUUID().toString();
            String refreshUuid = UUID.randomUUID().toString();
            loginSessions.put("login_user:" + accessUuid, copy(loginUser));
            loginSessions.put("login_user:" + refreshUuid, copy(loginUser));
            return Map.of(
                    "accessToken", legacyToken(accessUuid, userId, TimeUnit.HOURS.toMillis(2)),
                    "refreshToken", legacyToken(refreshUuid, userId, TimeUnit.DAYS.toMillis(7)));
        }

        private String legacyToken(String uuid, long userId, long expiration) {
            Date issuedAt = new Date();
            return Jwts.builder()
                    .claim("uuid", uuid)
                    .claim("userId", userId)
                    .issuedAt(issuedAt)
                    .expiration(new Date(issuedAt.getTime() + expiration))
                    .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                    .compact();
        }

        private String issueCustomAccess(long sessionUserId,
                                         long claimUserId,
                                         String tokenType,
                                         boolean matchingSessionId) {
            LoginUser loginUser = loginUser(sessionUserId);
            service.captureAuthVersion(loginUser);
            String sessionId = UUID.randomUUID().toString();
            loginSessions.put("login_user:" + sessionId, copy(loginUser));
            String claimedSessionId = matchingSessionId ? sessionId : UUID.randomUUID().toString();
            Date issuedAt = new Date();
            return Jwts.builder()
                    .claim("uuid", sessionId)
                    .claim("session_id", claimedSessionId)
                    .claim("userId", claimUserId)
                    .claim("token_type", tokenType)
                    .issuedAt(issuedAt)
                    .expiration(new Date(issuedAt.getTime() + TimeUnit.HOURS.toMillis(2)))
                    .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                    .compact();
        }

        private static LoginUser copy(LoginUser source) {
            LoginUser copy = new LoginUser();
            copy.setUserId(source.getUserId());
            copy.setUsername(source.getUsername());
            copy.setPassword(source.getPassword());
            copy.setTenantId(source.getTenantId());
            copy.setPermissions(source.getPermissions());
            copy.setDeptId(source.getDeptId());
            copy.setDataScope(source.getDataScope());
            copy.setAdmin(source.isAdmin());
            copy.setRoleKeys(source.getRoleKeys());
            copy.setMfaVerified(source.isMfaVerified());
            copy.setAuthVersion(source.getAuthVersion());
            copy.setUserAuthVersion(source.getUserAuthVersion());
            copy.setAuthVersionBound(source.isAuthVersionBound());
            if (source.isImpersonating()) {
                copy.setActorUserId(source.getActorUserId());
                copy.setActorUsername(source.getActorUsername());
                copy.setActorSessionId(source.getActorSessionId());
                copy.setActorUserAuthVersion(source.getActorUserAuthVersion());
                copy.setImpersonationSessionId(source.getImpersonationSessionId());
                copy.setImpersonationTabId(source.getImpersonationTabId());
                copy.setImpersonationStartTime(source.getImpersonationStartTime());
                copy.setImpersonationExpireTime(source.getImpersonationExpireTime());
            }
            copy.setEnabled(source.isEnabled());
            return copy;
        }
    }
}
