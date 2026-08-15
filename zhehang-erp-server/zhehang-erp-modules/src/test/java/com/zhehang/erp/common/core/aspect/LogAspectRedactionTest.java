package com.zhehang.erp.common.core.aspect;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.interceptor.ImpersonationGuardInterceptor;
import com.zhehang.erp.security.domain.LoginUser;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class LogAspectRedactionTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ApplicationContext applicationContext;
    private LogAspect aspect;

    @BeforeEach
    void setUp() {
        applicationContext = mock(ApplicationContext.class);
        aspect = new LogAspect(objectMapper, applicationContext);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void recursivelyRedactsSensitiveFieldsWithoutChangingNormalLogData() throws Exception {
        Map<String, Object> source = new LinkedHashMap<>();
        source.put("displayName", "正常名称");
        source.put("password", "password-raw");
        source.put("newPassword", "new-password-raw");
        source.put("old_password", "old-password-raw");
        source.put("profile", Map.of(
                "phone", "phone-raw",
                "idCardNo", "id-card-raw",
                "department", "财务部"
        ));
        source.put("integrations", List.of(Map.of(
                "appSecret", "app-secret-raw",
                "client_secret", "client-secret-raw",
                "signKey", "sign-key-raw"
        )));
        source.put("credentials", Map.of(
                "token", "token-raw",
                "tokens", List.of("token-list-raw"),
                "access_token", "access-token-raw",
                "refreshToken", "refresh-token-raw",
                "bankCardNo", "bank-card-raw"
        ));

        String json = aspect.serializeForLog(source);
        JsonNode tree = objectMapper.readTree(json);

        assertThat(tree.path("displayName").asText()).isEqualTo("正常名称");
        assertThat(tree.path("profile").path("department").asText()).isEqualTo("财务部");
        assertThat(tree.path("password").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("newPassword").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("old_password").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("profile").path("phone").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("profile").path("idCardNo").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("integrations").path(0).path("appSecret").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("integrations").path(0).path("client_secret").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("integrations").path(0).path("signKey").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("credentials").path("token").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("credentials").path("tokens").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("credentials").path("access_token").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("credentials").path("refreshToken").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("credentials").path("bankCardNo").asText()).isEqualTo("[REDACTED]");
        assertThat(json).doesNotContain(
                "password-raw", "new-password-raw", "old-password-raw", "phone-raw", "id-card-raw",
                "app-secret-raw", "client-secret-raw", "sign-key-raw", "token-raw", "token-list-raw",
                "access-token-raw", "refresh-token-raw", "bank-card-raw"
        );
        // 脱敏在 JsonNode 副本上进行，不能污染控制器后续仍要使用的请求对象。
        assertThat(source.get("password")).isEqualTo("password-raw");
    }

    @Test
    void redactsDirectScalarArgumentsByMethodParameterNameAndKeepsArrayShape() throws Exception {
        Object[] args = {42L, "plain-new-password", Map.of("remark", "正常备注", "contactPhone", "phone-raw")};
        String[] parameterNames = {"employeeId", "newPassword", "payload"};

        String json = aspect.serializeArgumentsForLog(args, parameterNames);
        JsonNode tree = objectMapper.readTree(json);

        assertThat(tree.isArray()).isTrue();
        assertThat(tree.path(0).asLong()).isEqualTo(42L);
        assertThat(tree.path(1).asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path(2).path("remark").asText()).isEqualTo("正常备注");
        assertThat(tree.path(2).path("contactPhone").asText()).isEqualTo("[REDACTED]");
        assertThat(json).doesNotContain("plain-new-password", "phone-raw");
    }

    @Test
    void recursivelyRedactsSensitiveFieldsInsideResponseEnvelope() throws Exception {
        Map<String, Object> response = Map.of(
                "code", 200,
                "message", "操作成功",
                "data", Map.of(
                        "accessToken", "response-access-token",
                        "refreshToken", "response-refresh-token",
                        "user", Map.of("name", "员工甲", "mobilePhone", "response-phone")
                )
        );

        String json = aspect.serializeForLog(response);
        JsonNode tree = objectMapper.readTree(json);

        assertThat(tree.path("code").asInt()).isEqualTo(200);
        assertThat(tree.path("message").asText()).isEqualTo("操作成功");
        assertThat(tree.path("data").path("user").path("name").asText()).isEqualTo("员工甲");
        assertThat(tree.path("data").path("accessToken").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("data").path("refreshToken").asText()).isEqualTo("[REDACTED]");
        assertThat(tree.path("data").path("user").path("mobilePhone").asText()).isEqualTo("[REDACTED]");
        assertThat(json).doesNotContain("response-access-token", "response-refresh-token", "response-phone");
    }

    @Test
    void publishedAuditEventContainsOnlyRedactedRequestAndResponsePayloads() throws Exception {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(12L);
        loginUser.setTenantId(7L);
        loginUser.setUsername("auditor");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
        AuditedFixture fixture = new AuditedFixture();
        Method method = AuditedFixture.class.getDeclaredMethod("saveConfig", String.class, Map.class);
        JoinPoint joinPoint = mock(JoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(signature.getParameterNames()).thenReturn(new String[]{"signKey", "body"});
        when(joinPoint.getTarget()).thenReturn(fixture);
        when(joinPoint.getArgs()).thenReturn(new Object[]{
                "direct-sign-key",
                Map.of("company", "正常企业", "appSecret", "request-app-secret")
        });
        Map<String, Object> result = Map.of(
                "message", "操作成功",
                "data", Map.of("accessToken", "response-token", "displayName", "正常结果")
        );

        aspect.doBefore(joinPoint);
        aspect.doAfterReturning(joinPoint, result);

        org.mockito.ArgumentCaptor<LogAspect.OperLogEvent> eventCaptor =
                org.mockito.ArgumentCaptor.forClass(LogAspect.OperLogEvent.class);
        verify(applicationContext).publishEvent(eventCaptor.capture());
        Map<String, Object> logData = eventCaptor.getValue().getLogData();
        String requestParams = String.valueOf(logData.get("requestParams"));
        String responseResult = String.valueOf(logData.get("responseResult"));
        assertThat(logData.get("tenantId")).isEqualTo(7L);
        assertThat(requestParams)
                .contains("[REDACTED]", "正常企业")
                .doesNotContain("direct-sign-key", "request-app-secret");
        assertThat(responseResult)
                .contains("[REDACTED]", "正常结果")
                .doesNotContain("response-token");
    }

    @Test
    void impersonationAuditIsNotDuplicatedByTheAsyncLogAspect() throws Exception {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(27L);
        loginUser.setUsername("target-employee");
        loginUser.setTenantId(9L);
        loginUser.setActorUserId(3L);
        loginUser.setActorUsername("platform-super-admin");
        loginUser.setImpersonationSessionId("imp-session-1");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/system/impersonation/end");
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.66");
        request.addHeader("X-Real-IP", "198.51.100.7");
        request.setAttribute(ImpersonationGuardInterceptor.AUDIT_ID_ATTRIBUTE, 101L);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        AuditedFixture fixture = new AuditedFixture();
        Method method = AuditedFixture.class.getDeclaredMethod("saveConfig", String.class, Map.class);
        JoinPoint joinPoint = mock(JoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(signature.getParameterNames()).thenReturn(new String[]{"signKey", "body"});
        when(joinPoint.getTarget()).thenReturn(fixture);
        when(joinPoint.getArgs()).thenReturn(new Object[]{"secret", Map.of("remark", "只读检查")});

        aspect.doBefore(joinPoint);
        aspect.doAfterReturning(joinPoint, Map.of("message", "ok"));

        verifyNoInteractions(applicationContext);
        assertThat(request.getAttribute(LogAspect.OPER_LOG_RECORDED_ATTRIBUTE))
                .isEqualTo(Boolean.TRUE);
    }

    @Test
    void auditAnnotationCanOmitEntireCustomerImportRequestAndResponse() throws Exception {
        AuditedFixture fixture = new AuditedFixture();
        Method method = AuditedFixture.class.getDeclaredMethod("importCustomers", Map.class);
        JoinPoint joinPoint = mock(JoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.getTarget()).thenReturn(fixture);
        when(joinPoint.getArgs()).thenReturn(new Object[]{Map.of(
                "company", "不应入日志的公司",
                "phone", "13800138000"
        )});

        aspect.doBefore(joinPoint);
        aspect.doAfterReturning(joinPoint, Map.of("company", "不应入日志的结果"));

        org.mockito.ArgumentCaptor<LogAspect.OperLogEvent> eventCaptor =
                org.mockito.ArgumentCaptor.forClass(LogAspect.OperLogEvent.class);
        verify(applicationContext).publishEvent(eventCaptor.capture());
        Map<String, Object> logData = eventCaptor.getValue().getLogData();
        assertThat(logData.get("requestParams")).isEqualTo("");
        assertThat(logData.get("responseResult")).isEqualTo("");
        assertThat(objectMapper.writeValueAsString(logData))
                .doesNotContain("不应入日志的公司", "13800138000", "不应入日志的结果");
    }

    @Test
    void afterThrowingDoesNotPublishExceptionMessageContainingSecret() throws Exception {
        AuditedFixture fixture = new AuditedFixture();
        Method method = AuditedFixture.class.getDeclaredMethod("saveConfig", String.class, Map.class);
        JoinPoint joinPoint = mock(JoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(signature.getParameterNames()).thenReturn(new String[]{"signKey", "body"});
        when(joinPoint.getTarget()).thenReturn(fixture);
        when(joinPoint.getArgs()).thenReturn(new Object[]{
                "request-sign-key",
                Map.of("company", "正常企业")
        });
        String exceptionSecret = "exception-secret-must-not-be-persisted";

        // 不先调用 doBefore，同时验证 START_TIME 缺失时异常审计仍能安全落事件。
        aspect.doAfterThrowing(joinPoint,
                new IllegalStateException("调用失败，clientSecret=" + exceptionSecret));

        org.mockito.ArgumentCaptor<LogAspect.OperLogEvent> eventCaptor =
                org.mockito.ArgumentCaptor.forClass(LogAspect.OperLogEvent.class);
        verify(applicationContext).publishEvent(eventCaptor.capture());
        Map<String, Object> logData = eventCaptor.getValue().getLogData();
        assertThat(logData.get("errorMsg")).isEqualTo("IllegalStateException(详情已隐去)");
        assertThat(logData.get("costTime")).isEqualTo(0L);
        assertThat(String.valueOf(logData.get("errorMsg")))
                .doesNotContain(exceptionSecret, "clientSecret");
        assertThat(objectMapper.writeValueAsString(logData))
                .contains("[REDACTED]", "正常企业")
                .doesNotContain(exceptionSecret, "request-sign-key");
    }

    private static class AuditedFixture {
        @Log(module = "测试配置", type = Log.OperationType.UPDATE)
        public void saveConfig(String signKey, Map<String, Object> body) {
            // 仅供切面测试反射方法签名。
        }

        @Log(module = "客户导入", type = Log.OperationType.IMPORT,
                saveRequestData = false, saveResponseData = false)
        public void importCustomers(Map<String, Object> body) {
            // 仅供切面测试反射方法签名。
        }
    }
}
