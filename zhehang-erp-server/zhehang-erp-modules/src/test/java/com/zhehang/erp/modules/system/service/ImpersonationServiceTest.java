package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.auth.service.UserDetailsServiceImpl;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationCandidateRow;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationEndRequest;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationStartRequest;
import com.zhehang.erp.modules.system.domain.entity.SysImpersonationSession;
import com.zhehang.erp.modules.system.mapper.SysImpersonationSessionMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImpersonationServiceTest {

    private static final Long TENANT_ID = 7L;
    private static final Long TARGET_USER_ID = 27L;
    private static final String SESSION_ID = "imp-session-27";
    private static final String TAB_ID = "tab-admin-001";

    @Mock
    private SysImpersonationSessionMapper sessionMapper;
    @Mock
    private UserDetailsServiceImpl userDetailsService;
    @Mock
    private TokenService tokenService;

    private ImpersonationService service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), "impersonation-service-test"),
                SysImpersonationSession.class);
        service = new ImpersonationService(
                sessionMapper, userDetailsService, tokenService, new ObjectMapper());
        loginAs(platformAdmin());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void startPersistsAuditableSessionAndReturnsDedicatedToken() {
        ImpersonationCandidateRow candidate = candidate();
        LoginUser effectiveLogin = targetLogin();
        long startedAt = 1_788_000_000_000L;
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(candidate);
        when(userDetailsService.loadActiveUserForImpersonation(TARGET_USER_ID, TENANT_ID))
                .thenReturn(effectiveLogin);
        when(tokenService.createImpersonationToken(any(), same(effectiveLogin), anyString()))
                .thenReturn(new TokenService.ImpersonationToken(
                        "dedicated-impersonation-token", startedAt, startedAt + 30 * 60 * 1000L));
        when(sessionMapper.insert(any(SysImpersonationSession.class))).thenReturn(1);

        MockHttpServletRequest httpRequest = request(TAB_ID);
        httpRequest.addHeader("User-Agent", "JUnit browser");
        httpRequest.addHeader("Sec-CH-UA-Platform", "macOS");
        httpRequest.addHeader("X-Forwarded-For", "198.51.100.99, 203.0.113.8");
        httpRequest.addHeader("X-Real-IP", "203.0.113.8");
        ImpersonationStartRequest startRequest = startRequest();
        startRequest.setReason("  检查销售人员权限  ");

        var result = service.start(startRequest, httpRequest);

        ArgumentCaptor<SysImpersonationSession> sessionCaptor =
                ArgumentCaptor.forClass(SysImpersonationSession.class);
        verify(sessionMapper).insert(sessionCaptor.capture());
        SysImpersonationSession stored = sessionCaptor.getValue();
        assertThat(stored.getSessionId()).isNotBlank();
        assertThat(stored.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(stored.getActorUserId()).isEqualTo(3L);
        assertThat(stored.getEffectiveUserId()).isEqualTo(TARGET_USER_ID);
        assertThat(stored.getReason()).isEqualTo("检查销售人员权限");
        assertThat(stored.getStatus()).isEqualTo("ACTIVE");
        assertThat(stored.getTabId()).isEqualTo(TAB_ID);
        assertThat(stored.getIpAddr()).isEqualTo("203.0.113.8");
        assertThat(stored.getEffectiveRoleNames()).isEqualTo("[\"销售人员\",\"部门主管\"]");
        assertThat(ChronoUnit.MINUTES.between(stored.getStartTime(), stored.getExpireTime()))
                .isEqualTo(30);
        assertThat(result.getImpersonationToken()).isEqualTo("dedicated-impersonation-token");
        assertThat(result.getTargetUserId()).isEqualTo(TARGET_USER_ID);
        assertThat(result.isMultipleRoles()).isTrue();
    }

    @Test
    void startCompensatesDedicatedTokenWhenAuditInsertFails() {
        LoginUser effectiveLogin = targetLogin();
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(candidate());
        when(userDetailsService.loadActiveUserForImpersonation(TARGET_USER_ID, TENANT_ID))
                .thenReturn(effectiveLogin);
        when(tokenService.createImpersonationToken(any(), same(effectiveLogin), anyString()))
                .thenReturn(new TokenService.ImpersonationToken("token", 10_000L, 1_810_000L));
        when(sessionMapper.insert(any(SysImpersonationSession.class)))
                .thenThrow(new IllegalStateException("database unavailable"));

        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("database unavailable");

        ArgumentCaptor<String> sessionIdCaptor = ArgumentCaptor.forClass(String.class);
        verify(tokenService).createImpersonationToken(any(), same(effectiveLogin), sessionIdCaptor.capture());
        verify(tokenService).revokeImpersonationSession(sessionIdCaptor.getValue());
    }

    @Test
    void rapidSwitchRevokesPreviousSessionInSameTabBeforeIssuingNextToken() {
        LoginUser targetLogin = targetLogin();
        SysImpersonationSession previous = activeSession();
        previous.setSessionId("previous-session");
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(candidate());
        when(userDetailsService.loadActiveUserForImpersonation(TARGET_USER_ID, TENANT_ID))
                .thenReturn(targetLogin);
        when(sessionMapper.selectList(any())).thenReturn(List.of(previous));
        when(sessionMapper.update(isNull(), any())).thenReturn(1);
        when(tokenService.createImpersonationToken(any(), same(targetLogin), anyString()))
                .thenReturn(new TokenService.ImpersonationToken("next-token", 10_000L, 1_810_000L));
        when(sessionMapper.insert(any(SysImpersonationSession.class))).thenReturn(1);

        service.start(startRequest(), request(TAB_ID));

        InOrder ordered = inOrder(tokenService, sessionMapper);
        ordered.verify(sessionMapper).selectList(any());
        ordered.verify(tokenService).revokeImpersonationSession("previous-session");
        ordered.verify(sessionMapper).update(isNull(), any());
        ordered.verify(tokenService).createImpersonationToken(any(), same(targetLogin), anyString());
        ordered.verify(sessionMapper).insert(any(SysImpersonationSession.class));
    }

    @Test
    void ordinaryAdministratorCannotListOrStartImpersonation() {
        LoginUser ordinaryAdmin = new LoginUser();
        ordinaryAdmin.setUserId(2L);
        ordinaryAdmin.setUsername("ordinary-admin");
        ordinaryAdmin.setTenantId(TENANT_ID);
        ordinaryAdmin.setAdmin(true);
        loginAs(ordinaryAdmin);

        assertThatThrownBy(() -> service.candidates(null, null))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("固定平台超级管理员");
        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("固定平台超级管理员");
        verifyNoInteractions(sessionMapper, userDetailsService, tokenService);
    }

    @Test
    void platformRootCannotListOrStartImpersonation() {
        LoginUser platformRoot = new LoginUser();
        platformRoot.setUserId(1L);
        platformRoot.setUsername("admin");
        platformRoot.setTenantId(TENANT_ID);
        platformRoot.setAdmin(true);
        loginAs(platformRoot);

        assertThatThrownBy(() -> service.candidates(null, null))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("固定平台超级管理员");
        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("固定平台超级管理员");
        verifyNoInteractions(sessionMapper, userDetailsService, tokenService);
    }

    @Test
    void platformRootAndOwnerCannotBeImpersonationTargets() {
        for (long protectedTargetId : new long[]{1L, 3L}) {
            ImpersonationStartRequest protectedRequest = startRequest();
            protectedRequest.setTargetUserId(protectedTargetId);
            assertThatThrownBy(() -> service.start(protectedRequest, request(TAB_ID)))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("根账号或当前实际管理员");
        }
        verifyNoInteractions(sessionMapper, userDetailsService, tokenService);
    }

    @Test
    void candidateAndLoadedIdentityMustMatchRequestedUserAndTenant() {
        ImpersonationCandidateRow wrongCandidate = candidate();
        wrongCandidate.setUserId(99L);
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(wrongCandidate);

        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("当前公司");
        verifyNoInteractions(userDetailsService, tokenService);
        verify(sessionMapper, never()).insert(any());
    }

    @Test
    void disabledOrCrossTenantTargetBecomesRealSecurityDenial() {
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(candidate());
        when(userDetailsService.loadActiveUserForImpersonation(TARGET_USER_ID, TENANT_ID))
                .thenThrow(new BusinessException(403, "目标员工已停用"));

        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("安全校验失败")
                .hasCauseInstanceOf(BusinessException.class);

        verifyNoInteractions(tokenService);
        verify(sessionMapper, never()).insert(any());
    }

    @Test
    void tokenSigningSecurityRaceBecomesRealSecurityDenial() {
        LoginUser effectiveLogin = targetLogin();
        when(sessionMapper.selectCandidateByUserId(TENANT_ID, TARGET_USER_ID)).thenReturn(candidate());
        when(userDetailsService.loadActiveUserForImpersonation(TARGET_USER_ID, TENANT_ID))
                .thenReturn(effectiveLogin);
        when(tokenService.createImpersonationToken(any(), same(effectiveLogin), anyString()))
                .thenThrow(new BusinessException(401, "权限版本已变化"));

        assertThatThrownBy(() -> service.start(startRequest(), request(TAB_ID)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("安全校验失败")
                .hasCauseInstanceOf(BusinessException.class);

        verify(sessionMapper, never()).insert(any());
    }

    @Test
    void currentRequiresRequestTokenSecurityContextDatabaseAndSameTab() {
        LoginUser effectiveLogin = effectiveLogin();
        loginAs(effectiveLogin);
        MockHttpServletRequest request = request(TAB_ID);
        when(tokenService.getLoginUser(request)).thenReturn(effectiveLogin);
        when(sessionMapper.selectById(SESSION_ID)).thenReturn(activeSession());

        var current = service.current(request);

        assertThat(current.isActive()).isTrue();
        assertThat(current.getImpersonationToken()).isNull();
        assertThat(current.getSessionId()).isEqualTo(SESSION_ID);
        verify(tokenService, never()).revokeImpersonationSession(anyString());
    }

    @Test
    void crossTabRequestIsDeniedWithoutKillingLegitimateTabSession() {
        LoginUser effectiveLogin = effectiveLogin();
        loginAs(effectiveLogin);
        MockHttpServletRequest request = request("another-tab-001");
        when(tokenService.getLoginUser(request)).thenReturn(effectiveLogin);
        when(sessionMapper.selectById(SESSION_ID)).thenReturn(activeSession());

        assertThatThrownBy(() -> service.current(request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("当前标签页");

        verify(tokenService, never()).revokeImpersonationSession(anyString());
        verify(sessionMapper, never()).update(isNull(), any());
    }

    @Test
    void endRevokesTokenBeforeMarkingAuditSessionEnded() {
        LoginUser effectiveLogin = effectiveLogin();
        loginAs(effectiveLogin);
        MockHttpServletRequest request = request(TAB_ID);
        when(tokenService.getLoginUser(request)).thenReturn(effectiveLogin);
        when(sessionMapper.selectById(SESSION_ID)).thenReturn(activeSession());
        when(sessionMapper.update(isNull(), any())).thenReturn(1);
        ImpersonationEndRequest endRequest = new ImpersonationEndRequest();
        endRequest.setReason("排查结束");

        service.end(endRequest, request);

        InOrder ordered = inOrder(tokenService, sessionMapper);
        ordered.verify(tokenService).getLoginUser(request);
        ordered.verify(sessionMapper).selectById(SESSION_ID);
        ordered.verify(tokenService).revokeImpersonationSession(SESSION_ID);
        ordered.verify(sessionMapper).update(isNull(), any());
    }

    @Test
    void revokeFailurePreventsFalseEndedAuditState() {
        LoginUser effectiveLogin = effectiveLogin();
        loginAs(effectiveLogin);
        MockHttpServletRequest request = request(TAB_ID);
        when(tokenService.getLoginUser(request)).thenReturn(effectiveLogin);
        when(sessionMapper.selectById(SESSION_ID)).thenReturn(activeSession());
        doThrow(new IllegalStateException("redis unavailable"))
                .when(tokenService).revokeImpersonationSession(SESSION_ID);

        assertThatThrownBy(() -> service.end(null, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("redis unavailable");

        verify(sessionMapper, never()).update(isNull(), any());
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    void expiredDatabaseSessionIsRevokedAndMarkedExpiredWithoutNullPointer() {
        LoginUser effectiveLogin = effectiveLogin();
        loginAs(effectiveLogin);
        MockHttpServletRequest request = request(TAB_ID);
        SysImpersonationSession expired = activeSession();
        expired.setExpireTime(null);
        when(tokenService.getLoginUser(request)).thenReturn(effectiveLogin);
        when(sessionMapper.selectById(SESSION_ID)).thenReturn(expired);
        when(sessionMapper.update(isNull(), any())).thenReturn(1);

        assertThatThrownBy(() -> service.current(request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("到期");

        verify(tokenService).revokeImpersonationSession(SESSION_ID);
        ArgumentCaptor<LambdaUpdateWrapper> wrapperCaptor =
                ArgumentCaptor.forClass(LambdaUpdateWrapper.class);
        verify(sessionMapper).update(isNull(), wrapperCaptor.capture());
        LambdaUpdateWrapper<SysImpersonationSession> wrapper = wrapperCaptor.getValue();
        wrapper.getSqlSet();
        assertThat(wrapper.getParamNameValuePairs().values())
                .contains("EXPIRED", "30分钟会话到期");
    }

    private ImpersonationStartRequest startRequest() {
        ImpersonationStartRequest request = new ImpersonationStartRequest();
        request.setTargetUserId(TARGET_USER_ID);
        request.setReason("检查销售人员权限");
        request.setTabId(TAB_ID);
        return request;
    }

    private ImpersonationCandidateRow candidate() {
        ImpersonationCandidateRow row = new ImpersonationCandidateRow();
        row.setUserId(TARGET_USER_ID);
        row.setDisplayName("张三");
        row.setDeptId(8L);
        row.setDeptName("销售部");
        row.setRoleNamesJson("[\"销售人员\",\"部门主管\"]");
        row.setRoleKeysJson("[\"sales\",\"dept_manager\"]");
        row.setRoleCount(2);
        return row;
    }

    private LoginUser platformAdmin() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(3L);
        loginUser.setUsername("admin");
        loginUser.setTenantId(TENANT_ID);
        loginUser.setAdmin(true);
        return loginUser;
    }

    private LoginUser effectiveLogin() {
        LoginUser loginUser = targetLogin();
        loginUser.setActorUserId(3L);
        loginUser.setActorUsername("admin");
        loginUser.setActorSessionId("admin-base-session");
        loginUser.setImpersonationSessionId(SESSION_ID);
        loginUser.setImpersonationTabId(TAB_ID);
        loginUser.setImpersonationStartTime(System.currentTimeMillis());
        loginUser.setImpersonationExpireTime(System.currentTimeMillis() + 30 * 60 * 1000L);
        return loginUser;
    }

    private LoginUser targetLogin() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(TARGET_USER_ID);
        loginUser.setUsername("sales-27");
        loginUser.setTenantId(TENANT_ID);
        loginUser.setDeptId(8L);
        return loginUser;
    }

    private SysImpersonationSession activeSession() {
        SysImpersonationSession session = new SysImpersonationSession();
        session.setSessionId(SESSION_ID);
        session.setTenantId(TENANT_ID);
        session.setActorUserId(3L);
        session.setActorUsername("admin");
        session.setEffectiveUserId(TARGET_USER_ID);
        session.setEffectiveUsername("张三");
        session.setEffectiveDeptId(8L);
        session.setEffectiveDeptName("销售部");
        session.setEffectiveRoleNames("[\"销售人员\"]");
        session.setEffectiveRoleCount(1);
        session.setReason("检查销售人员权限");
        session.setTabId(TAB_ID);
        session.setStatus("ACTIVE");
        session.setStartTime(LocalDateTime.now().minusMinutes(1));
        session.setExpireTime(LocalDateTime.now().plusMinutes(29));
        return session;
    }

    private MockHttpServletRequest request(String tabId) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Impersonation-Tab-Id", tabId);
        request.setRemoteAddr("127.0.0.1");
        return request;
    }

    private void loginAs(LoginUser loginUser) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        loginUser, null, List.copyOf(loginUser.getAuthorities())));
    }
}
