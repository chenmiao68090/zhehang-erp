package com.zhehang.erp.common.core.interceptor;

import com.zhehang.erp.common.core.annotation.AllowDuringImpersonationRead;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.aspect.LogAspect;
import com.zhehang.erp.common.core.audit.ImpersonationAuditSink;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.method.HandlerMethod;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ImpersonationGuardInterceptorTest {

    private ImpersonationAuditSink auditSink;
    private ImpersonationGuardInterceptor interceptor;

    @BeforeEach
    void setUp() {
        auditSink = mock(ImpersonationAuditSink.class);
        when(auditSink.begin(org.mockito.ArgumentMatchers.any())).thenReturn(101L);
        interceptor = new ImpersonationGuardInterceptor(auditSink);
        bindImpersonation();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void allowsSafeGetAndAuditsActorAndEffectiveUserSeparately() throws Exception {
        MockHttpServletRequest request = request("GET", "/crm/customer/list");
        request.addHeader("X-Forwarded-For", "203.0.113.66");
        request.addHeader("X-Real-IP", "198.51.100.7");
        MockHttpServletResponse response = new MockHttpServletResponse();
        HandlerMethod handler = handler(new Fixture(), "auditedGet");

        assertThat(interceptor.preHandle(request, response, handler)).isTrue();
        interceptor.afterCompletion(request, response, handler, null);

        org.mockito.ArgumentCaptor<ImpersonationAuditSink.Entry> entryCaptor =
                org.mockito.ArgumentCaptor.forClass(ImpersonationAuditSink.Entry.class);
        verify(auditSink).begin(entryCaptor.capture());
        ImpersonationAuditSink.Entry entry = entryCaptor.getValue();
        assertThat(entry.module()).isEqualTo("客户查询");
        assertThat(entry.operationType()).isEqualTo("QUERY");
        assertThat(entry.operatorId()).isEqualTo(3L);
        assertThat(entry.actorUserId()).isEqualTo(3L);
        assertThat(entry.actorUsername()).isEqualTo("platform-super-admin");
        assertThat(entry.effectiveUserId()).isEqualTo(27L);
        assertThat(entry.effectiveUsername()).isEqualTo("target-employee");
        assertThat(entry.impersonationSessionId()).isEqualTo("imp-session-1");
        assertThat(entry.tenantId()).isEqualTo(9L);
        assertThat(entry.requestUri()).isEqualTo("/crm/customer/list");
        assertThat(entry.requestMethod()).isEqualTo("GET");
        assertThat(entry.ipAddress()).isEqualTo("198.51.100.7");
        verify(auditSink).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_SUCCESS),
                org.mockito.ArgumentMatchers.eq(""),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void doesNotAffectOrdinaryAuthenticatedRequests() throws Exception {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(27L);
        loginUser.setUsername("ordinary-user");
        loginUser.setTenantId(9L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
        MockHttpServletRequest request = request("POST", "/crm/customer");

        assertThat(interceptor.preHandle(
                request, new MockHttpServletResponse(), handler(new Fixture(), "ordinaryPost")))
                .isTrue();
        verifyNoInteractions(auditSink);
    }

    @Test
    void blocksAllWriteMethodsByDefaultAndAuditsEachDenial() throws Exception {
        HandlerMethod handler = handler(new Fixture(), "ordinaryPost");

        for (String method : List.of("POST", "PUT", "PATCH", "DELETE")) {
            MockHttpServletRequest request = request(method, "/crm/customer/42");
            assertThatThrownBy(() -> interceptor.preHandle(
                    request, new MockHttpServletResponse(), handler))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("只读模式");
            assertThat(request.getAttribute(ImpersonationGuardInterceptor.AUDIT_RECORDED_ATTRIBUTE))
                    .isEqualTo(Boolean.TRUE);
        }

        verify(auditSink, times(4)).begin(org.mockito.ArgumentMatchers.any());
        verify(auditSink, times(4)).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_FAILURE),
                org.mockito.ArgumentMatchers.eq("只读模式禁止写操作"),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void allowsOnlyExplicitlyReviewedReadOnlyPost() throws Exception {
        MockHttpServletRequest request = request("POST", "/crm/collision/check");
        MockHttpServletResponse response = new MockHttpServletResponse();
        HandlerMethod handler = handler(new Fixture(), "readOnlyPost");

        assertThat(interceptor.preHandle(request, response, handler)).isTrue();
        interceptor.afterCompletion(request, response, handler, null);

        verify(auditSink).begin(org.mockito.ArgumentMatchers.any());
        verify(auditSink).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_SUCCESS),
                org.mockito.ArgumentMatchers.eq(""),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void blocksSensitiveMethodsClassesExportsAndDownloadsEvenWhenGet() throws Exception {
        List<RequestCase> cases = List.of(
                new RequestCase("/org/employee/me", handler(new Fixture(), "sensitiveGet")),
                new RequestCase("/im/conversations", handler(new SensitiveFixture(), "view")),
                new RequestCase("/system/user/export", handler(new Fixture(), "safeGet")),
                new RequestCase("/file/info/download/8", handler(new Fixture(), "safeGet"))
        );

        for (RequestCase value : cases) {
            assertThatThrownBy(() -> interceptor.preHandle(
                    request("GET", value.path()), new MockHttpServletResponse(), value.handler()))
                    .isInstanceOf(AccessDeniedException.class);
        }

        verify(auditSink, times(cases.size())).begin(org.mockito.ArgumentMatchers.any());
        verify(auditSink, times(cases.size())).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_FAILURE),
                org.mockito.ArgumentMatchers.eq("敏感读取或文件传输"),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void allowsCurrentAndEndLifecycleEndpoints() throws Exception {
        HandlerMethod handler = handler(new Fixture(), "ordinaryPost");

        for (RequestCase value : List.of(
                new RequestCase("/system/impersonation/current", handler),
                new RequestCase("/system/impersonation/end", handler))) {
            String method = value.path().endsWith("/end") ? "POST" : "GET";
            MockHttpServletRequest request = request(method, value.path());
            MockHttpServletResponse response = new MockHttpServletResponse();
            assertThat(interceptor.preHandle(request, response, value.handler())).isTrue();
            interceptor.afterCompletion(request, response, value.handler(), null);
        }
        verify(auditSink, times(2)).begin(org.mockito.ArgumentMatchers.any());
        verify(auditSink, times(2)).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_SUCCESS),
                org.mockito.ArgumentMatchers.eq(""),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void finalizesPreAuditEvenWhenLogAspectMarkerIsPresent() throws Exception {
        MockHttpServletRequest request = request("GET", "/review/list");
        MockHttpServletResponse response = new MockHttpServletResponse();
        HandlerMethod handler = handler(new Fixture(), "safeGet");

        assertThat(interceptor.preHandle(request, response, handler)).isTrue();
        request.setAttribute(LogAspect.OPER_LOG_RECORDED_ATTRIBUTE, Boolean.TRUE);
        interceptor.afterCompletion(request, response, handler, null);

        verify(auditSink).begin(org.mockito.ArgumentMatchers.any());
        verify(auditSink).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_SUCCESS),
                org.mockito.ArgumentMatchers.eq(""),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void blocksRequestBeforeBusinessWhenSynchronousPreAuditFails() throws Exception {
        when(auditSink.begin(org.mockito.ArgumentMatchers.any()))
                .thenThrow(new IllegalStateException("database unavailable"));

        assertThatThrownBy(() -> interceptor.preHandle(
                request("GET", "/crm/customer/list"),
                new MockHttpServletResponse(), handler(new Fixture(), "safeGet")))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("审计暂不可用");

        verify(auditSink, never()).complete(
                org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.anyInt(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void updatesTheSamePreAuditRowForHttpFailureWithoutException() throws Exception {
        MockHttpServletRequest request = request("GET", "/crm/customer/list");
        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setStatus(503);
        HandlerMethod handler = handler(new Fixture(), "safeGet");

        assertThat(interceptor.preHandle(request, response, handler)).isTrue();
        interceptor.afterCompletion(request, response, handler, null);

        verify(auditSink).complete(
                org.mockito.ArgumentMatchers.eq(101L),
                org.mockito.ArgumentMatchers.eq(ImpersonationAuditSink.STATUS_FAILURE),
                org.mockito.ArgumentMatchers.eq("HTTP_503"),
                org.mockito.ArgumentMatchers.anyLong());
    }

    private void bindImpersonation() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(27L);
        loginUser.setUsername("target-employee");
        loginUser.setTenantId(9L);
        loginUser.setActorUserId(3L);
        loginUser.setActorUsername("platform-super-admin");
        loginUser.setImpersonationSessionId("imp-session-1");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }

    private MockHttpServletRequest request(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRemoteAddr("127.0.0.1");
        return request;
    }

    private HandlerMethod handler(Object bean, String methodName) throws Exception {
        Method method = bean.getClass().getDeclaredMethod(methodName);
        return new HandlerMethod(bean, method);
    }

    private record RequestCase(String path, HandlerMethod handler) {
    }

    private static class Fixture {
        public void safeGet() {
        }

        @Log(module = "客户查询", type = Log.OperationType.QUERY)
        public void auditedGet() {
        }

        public void ordinaryPost() {
        }

        @AllowDuringImpersonationRead("测试专用纯查询")
        public void readOnlyPost() {
        }

        @DenyDuringImpersonation(reason = "测试专用敏感读取")
        public void sensitiveGet() {
        }
    }

    @DenyDuringImpersonation(reason = "测试专用敏感控制器")
    private static class SensitiveFixture {
        public void view() {
        }
    }
}
