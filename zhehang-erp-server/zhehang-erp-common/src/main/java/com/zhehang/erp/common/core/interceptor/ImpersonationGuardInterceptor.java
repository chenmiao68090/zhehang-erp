package com.zhehang.erp.common.core.interceptor;

import com.zhehang.erp.common.core.annotation.AllowDuringImpersonationRead;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.audit.ImpersonationAuditSink;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.regex.Pattern;

/**
 * 员工视角的集中后端只读闸门。
 *
 * <p>安全策略失败收紧：GET/HEAD/OPTIONS 默认只读放行；任何敏感读取以及导出、
 * 下载均拒绝；POST/PUT/PATCH/DELETE 默认拒绝，仅允许经真实调用链审计并标记
 * {@link AllowDuringImpersonationRead} 的非 GET 查询。前端隐藏按钮只改善体验，
 * 不能替代本闸门。</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ImpersonationGuardInterceptor implements HandlerInterceptor {

    static final String AUDIT_IDENTITY_ATTRIBUTE =
            ImpersonationGuardInterceptor.class.getName() + ".identity";
    static final String AUDIT_STARTED_AT_ATTRIBUTE =
            ImpersonationGuardInterceptor.class.getName() + ".startedAt";
    static final String AUDIT_RECORDED_ATTRIBUTE =
            ImpersonationGuardInterceptor.class.getName() + ".recorded";
    /** 供 {@code @Log} 切面识别同步预审已经接管本次代登录请求，避免异步重复落库。 */
    public static final String AUDIT_ID_ATTRIBUTE =
            ImpersonationGuardInterceptor.class.getName() + ".auditId";

    private static final Pattern SENSITIVE_TRANSFER_PATH =
            Pattern.compile("(^|/)(export|download)(/|$)", Pattern.CASE_INSENSITIVE);
    private static final String CURRENT_PATH = "/system/impersonation/current";
    private static final String END_PATH = "/system/impersonation/end";
    private static final String DENIED_MESSAGE = "员工视角为只读模式，禁止执行该操作";
    private static final String AUDIT_UNAVAILABLE_MESSAGE = "代登录审计暂不可用，已阻止本次操作";

    private final ImpersonationAuditSink auditSink;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!SecurityUtils.isImpersonating()) {
            return true;
        }

        request.setAttribute(AUDIT_STARTED_AT_ATTRIBUTE, System.currentTimeMillis());
        AuditIdentity identity = captureIdentity();
        request.setAttribute(AUDIT_IDENTITY_ATTRIBUTE, identity);
        beginAudit(request, handler, identity);

        String path = normalizedPath(request);
        String method = request.getMethod();
        if (isCurrentEndpoint(path, method) || isEndEndpoint(path, method)) {
            return true;
        }

        HandlerMethod handlerMethod = handler instanceof HandlerMethod value ? value : null;
        if (isExplicitlyDenied(handlerMethod) || isSensitiveTransferPath(path)) {
            auditDenied(request, "敏感读取或文件传输");
            throw new AccessDeniedException(DENIED_MESSAGE);
        }

        if (isSafeHttpMethod(method)) {
            return true;
        }
        if (handlerMethod != null
                && handlerMethod.hasMethodAnnotation(AllowDuringImpersonationRead.class)) {
            return true;
        }

        auditDenied(request, "只读模式禁止写操作");
        throw new AccessDeniedException(DENIED_MESSAGE);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        if (!(request.getAttribute(AUDIT_IDENTITY_ATTRIBUTE) instanceof AuditIdentity identity)) {
            return;
        }
        if (Boolean.TRUE.equals(request.getAttribute(AUDIT_RECORDED_ATTRIBUTE))) {
            return;
        }
        long costTime = elapsedMillis(request);
        int status = ex == null && response.getStatus() < 400 ? 0 : 1;
        String error = ex != null
                ? ex.getClass().getSimpleName() + "(详情已隐去)"
                : response.getStatus() >= 400 ? "HTTP_" + response.getStatus() : "";
        completeAudit(request, identity, status, error, costTime);
    }

    private boolean isExplicitlyDenied(HandlerMethod handlerMethod) {
        return handlerMethod != null
                && (handlerMethod.hasMethodAnnotation(DenyDuringImpersonation.class)
                || handlerMethod.getBeanType().isAnnotationPresent(DenyDuringImpersonation.class));
    }

    private boolean isSensitiveTransferPath(String path) {
        return SENSITIVE_TRANSFER_PATH.matcher(path).find();
    }

    private boolean isSafeHttpMethod(String method) {
        return HttpMethod.GET.matches(method)
                || HttpMethod.HEAD.matches(method)
                || HttpMethod.OPTIONS.matches(method);
    }

    private boolean isCurrentEndpoint(String path, String method) {
        return CURRENT_PATH.equals(path) && HttpMethod.GET.matches(method);
    }

    private boolean isEndEndpoint(String path, String method) {
        return END_PATH.equals(path) && HttpMethod.POST.matches(method);
    }

    private String normalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        return uri.isBlank() ? "/" : uri;
    }

    private AuditIdentity captureIdentity() {
        return new AuditIdentity(
                SecurityUtils.getCurrentActorUserId(),
                SecurityUtils.getCurrentActorUsername(),
                SecurityUtils.getCurrentEffectiveUserId(),
                SecurityUtils.getCurrentUsername(),
                SecurityUtils.getCurrentTenantId(),
                SecurityUtils.getCurrentImpersonationSessionId());
    }

    private void auditDenied(HttpServletRequest request, String reason) {
        AuditIdentity identity = (AuditIdentity) request.getAttribute(AUDIT_IDENTITY_ATTRIBUTE);
        completeAudit(request, identity, ImpersonationAuditSink.STATUS_FAILURE,
                reason, elapsedMillis(request));
    }

    private long elapsedMillis(HttpServletRequest request) {
        Object started = request.getAttribute(AUDIT_STARTED_AT_ATTRIBUTE);
        return started instanceof Number number
                ? Math.max(0L, System.currentTimeMillis() - number.longValue())
                : 0L;
    }

    private void beginAudit(HttpServletRequest request, Object handler, AuditIdentity identity) {
        HandlerMethod handlerMethod = handler instanceof HandlerMethod value ? value : null;
        Log annotatedLog = handlerMethod == null ? null : handlerMethod.getMethodAnnotation(Log.class);
        String module = annotatedLog != null && !annotatedLog.module().isBlank()
                ? annotatedLog.module()
                : "代登录审计";
        String operationType = annotatedLog != null
                ? annotatedLog.type().name()
                : isSafeHttpMethod(request.getMethod()) ? "QUERY" : "OTHER";
        ImpersonationAuditSink.Entry entry = new ImpersonationAuditSink.Entry(
                module,
                operationType,
                valueOr(identity.actorUsername(), "platform-super-admin"),
                identity.actorUserId(),
                identity.actorUserId(),
                identity.actorUsername(),
                identity.effectiveUserId(),
                identity.effectiveUsername(),
                identity.sessionId(),
                identity.tenantId(),
                handlerName(handler),
                request.getRequestURI(),
                request.getMethod(),
                clientIp(request));
        try {
            Long auditId = auditSink.begin(entry);
            if (auditId == null) {
                throw new IllegalStateException("代登录预审未返回日志主键");
            }
            request.setAttribute(AUDIT_ID_ATTRIBUTE, auditId);
        } catch (RuntimeException e) {
            // 没有先形成可追溯记录，就绝不允许被模拟身份进入业务处理。
            log.error("代登录同步预审失败，已阻止请求: sessionId={}, uri={}",
                    identity.sessionId(), request.getRequestURI(), e);
            throw new AccessDeniedException(AUDIT_UNAVAILABLE_MESSAGE);
        }
    }

    private void completeAudit(HttpServletRequest request, AuditIdentity identity,
                               int status, String errorMsg, long costTime) {
        Object auditId = request.getAttribute(AUDIT_ID_ATTRIBUTE);
        if (!(auditId instanceof Long id)) {
            return;
        }
        try {
            auditSink.complete(id, status, errorMsg == null ? "" : errorMsg, costTime);
            request.setAttribute(AUDIT_RECORDED_ATTRIBUTE, Boolean.TRUE);
        } catch (RuntimeException e) {
            // 预写记录已经独立提交，因此更新失败时仍保留“处理中”证据，不能静默伪装成功。
            log.error("代登录同步审计收尾失败，预写记录保留处理中: auditId={}, sessionId={}, uri={}",
                    id, identity == null ? null : identity.sessionId(), request.getRequestURI(), e);
        }
    }

    private String handlerName(Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            return handlerMethod.getBeanType().getName() + "." + handlerMethod.getMethod().getName();
        }
        return handler == null ? "unknown" : handler.getClass().getName();
    }

    private String clientIp(HttpServletRequest request) {
        // 生产 Nginx 会覆盖 X-Real-IP；X-Forwarded-For 的首段可能由客户端预置，
        // 审计责任链不能优先信任它。
        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip == null || ip.isBlank() ? "unknown" : ip;
    }

    private String valueOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private record AuditIdentity(Long actorUserId, String actorUsername,
                                 Long effectiveUserId, String effectiveUsername,
                                 Long tenantId, String sessionId) {
    }
}
