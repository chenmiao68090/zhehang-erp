package com.zhehang.erp.common.core.aspect;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.interceptor.ImpersonationGuardInterceptor;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    /** 标记当前请求已由 @Log 记录，供代登录全量审计避免重复落两条。 */
    public static final String OPER_LOG_RECORDED_ATTRIBUTE =
            LogAspect.class.getName() + ".recorded";
    private static final String REDACTED_VALUE = "[REDACTED]";
    private static final int MAX_LOG_CONTENT_LENGTH = 2000;
    private static final Set<String> SENSITIVE_FIELD_NAMES = Set.of(
            "password", "newpassword", "oldpassword",
            "appsecret", "clientsecret", "signkey",
            "token", "accesstoken", "refreshtoken",
            "idcard", "phone", "bankcard"
    );
    private final ObjectMapper objectMapper;
    private final ApplicationContext applicationContext;
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();

    @Pointcut("@annotation(com.zhehang.erp.common.core.annotation.Log)")
    public void logPointCut() {}

    @Before("logPointCut()")
    public void doBefore(JoinPoint joinPoint) {
        START_TIME.set(System.currentTimeMillis());
    }

    @AfterReturning(pointcut = "logPointCut()", returning = "result")
    public void doAfterReturning(JoinPoint joinPoint, Object result) {
        handleLog(joinPoint, null, result);
    }

    @AfterThrowing(pointcut = "logPointCut()", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Exception e) {
        handleLog(joinPoint, e, null);
    }

    private void handleLog(JoinPoint joinPoint, Exception e, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Log logAnnotation = method.getAnnotation(Log.class);

            if (logAnnotation == null) return;

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

            Long effectiveUserId = SecurityUtils.getCurrentEffectiveUserId();
            Long actorUserId = SecurityUtils.getCurrentActorUserId();
            String effectiveUsername = SecurityUtils.getCurrentUsername();
            String actorUsername = SecurityUtils.getCurrentActorUsername();
            boolean impersonating = SecurityUtils.isImpersonating();
            if (impersonating && request != null
                    && request.getAttribute(ImpersonationGuardInterceptor.AUDIT_ID_ATTRIBUTE) != null) {
                // 代登录请求已在进入业务前同步预写，并由 Web 闸门精确更新同一条记录。
                // 这里禁止再发布异步事件，避免同一请求出现两条审计记录或异步丢失。
                request.setAttribute(OPER_LOG_RECORDED_ATTRIBUTE, Boolean.TRUE);
                return;
            }
            // 旧字段继续表示承担责任的真实操作人，禁止把代登录行为记到目标员工名下。
            String operator = impersonating ? actorUsername : effectiveUsername;
            Long operatorId = impersonating ? actorUserId : effectiveUserId;
            Long tenantId = SecurityUtils.getCurrentTenantId();
            String module = logAnnotation.module();
            String operationType = logAnnotation.type().name();
            String methodName = joinPoint.getTarget().getClass().getName() + "." + method.getName();
            String ip = request != null ? getIpAddress(request) : "unknown";
            String requestUri = request != null ? request.getRequestURI() : "";
            String requestMethod = request != null ? request.getMethod() : "";

            Long startedAt = START_TIME.get();
            long costTime = startedAt == null ? 0L : System.currentTimeMillis() - startedAt;

            // Build log params
            String params = "";
            if (logAnnotation.saveRequestData()) {
                try {
                    Object[] args = joinPoint.getArgs();
                    if (args != null && args.length > 0) {
                        params = serializeArgumentsForLog(args, resolveParameterNames(signature, method));
                    }
                } catch (Exception ex) {
                    params = "serialization error";
                }
            }

            String resultStr = "";
            if (logAnnotation.saveResponseData() && result != null) {
                try {
                    resultStr = serializeForLog(result);
                } catch (Exception ex) {
                    resultStr = "serialization error";
                }
            }

            int status = e == null ? 0 : 1;
            // 异常文本可能夹带密码/Token/SQL 参数，审计表只存异常类型，详情留在受控服务日志。
            String errorMsg = e != null ? e.getClass().getSimpleName() + "(详情已隐去)" : "";

            log.info("[OperationLog] operator={}, module={}, type={}, method={}, uri={} {}, ip={}, status={}, cost={}ms",
                    operator, module, operationType, methodName, requestMethod, requestUri, ip, status, costTime);

            // Persist to database asynchronously
            try {
                Map<String, Object> logData = new HashMap<>(Map.ofEntries(
                    Map.entry("module", module),
                    Map.entry("operType", operationType),
                    Map.entry("operator", operator != null ? operator : "anonymous"),
                    Map.entry("method", methodName),
                    Map.entry("requestUri", requestUri),
                    Map.entry("requestMethod", requestMethod),
                    Map.entry("requestParams", params),
                    Map.entry("responseResult", resultStr),
                    Map.entry("status", status),
                    Map.entry("errorMsg", errorMsg != null ? errorMsg : ""),
                    Map.entry("ipAddr", ip),
                    Map.entry("costTime", costTime)
                ));
                if (operatorId != null) {
                    logData.put("operatorId", operatorId);
                }
                if (actorUserId != null) {
                    logData.put("actorUserId", actorUserId);
                }
                if (actorUsername != null && !actorUsername.isBlank()) {
                    logData.put("actorUsername", actorUsername);
                }
                if (effectiveUserId != null) {
                    logData.put("effectiveUserId", effectiveUserId);
                }
                if (effectiveUsername != null && !effectiveUsername.isBlank()) {
                    logData.put("effectiveUsername", effectiveUsername);
                }
                String impersonationSessionId = SecurityUtils.getCurrentImpersonationSessionId();
                if (impersonationSessionId != null && !impersonationSessionId.isBlank()) {
                    logData.put("impersonationSessionId", impersonationSessionId);
                }
                if (tenantId != null) {
                    // @Async 监听器不继承 SecurityContext，必须在请求线程把租户一并放入事件。
                    logData.put("tenantId", tenantId);
                }
                // Publish event for async log persistence
                applicationContext.publishEvent(new OperLogEvent(logData));
                if (request != null) {
                    request.setAttribute(OPER_LOG_RECORDED_ATTRIBUTE, Boolean.TRUE);
                }
            } catch (Exception ex) {
                log.warn("Failed to publish log event: {}", ex.getMessage());
            }
        } catch (Exception ex) {
            log.error("Operation log recording failed: {}", ex.getMessage());
        } finally {
            START_TIME.remove();
        }
    }

    /**
     * 保持原有参数数组 JSON 结构，同时利用方法参数名保护直接传入的密码、令牌等标量值。
     * DTO、Map、List 及返回对象中的敏感字段由 {@link #redactSensitiveFields(JsonNode)} 递归处理。
     */
    String serializeArgumentsForLog(Object[] args, String[] parameterNames) throws JsonProcessingException {
        ArrayNode safeArgs = objectMapper.createArrayNode();
        for (int i = 0; i < args.length; i++) {
            String parameterName = parameterNames != null && i < parameterNames.length
                    ? parameterNames[i]
                    : null;
            if (isSensitiveFieldName(parameterName)) {
                safeArgs.add(REDACTED_VALUE);
            } else {
                safeArgs.add(toRedactedTree(args[i]));
            }
        }
        return truncate(objectMapper.writeValueAsString(safeArgs));
    }

    /** 将任意请求/响应对象复制为 JsonNode 后脱敏，不修改原业务对象。 */
    String serializeForLog(Object value) throws JsonProcessingException {
        return truncate(objectMapper.writeValueAsString(toRedactedTree(value)));
    }

    private JsonNode toRedactedTree(Object value) {
        JsonNode tree = objectMapper.valueToTree(value);
        redactSensitiveFields(tree);
        return tree;
    }

    private void redactSensitiveFields(JsonNode node) {
        if (node == null) {
            return;
        }
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            objectNode.fields().forEachRemaining(entry -> {
                if (isSensitiveFieldName(entry.getKey())) {
                    objectNode.set(entry.getKey(), TextNode.valueOf(REDACTED_VALUE));
                } else {
                    redactSensitiveFields(entry.getValue());
                }
            });
            return;
        }
        if (node.isArray()) {
            node.forEach(this::redactSensitiveFields);
        }
    }

    private boolean isSensitiveFieldName(String fieldName) {
        if (fieldName == null || fieldName.isBlank()) {
            return false;
        }
        String normalized = normalizeFieldName(fieldName);
        if (SENSITIVE_FIELD_NAMES.contains(normalized)) {
            return true;
        }
        // 覆盖 emergencyPhone、user_phone、passwordHash、csrfToken、idCardFront、bankCardNo 等常见变体。
        return normalized.contains("password")
                || normalized.contains("secret")
                || normalized.contains("signkey")
                || normalized.contains("token")
                || normalized.contains("idcard")
                || normalized.contains("phone")
                || normalized.contains("bankcard")
                || fieldName.contains("密码")
                || fieldName.contains("令牌")
                || fieldName.contains("密钥")
                || fieldName.contains("身份证")
                || fieldName.contains("手机号")
                || fieldName.contains("银行卡");
    }

    private String normalizeFieldName(String fieldName) {
        String lower = fieldName.toLowerCase(Locale.ROOT);
        StringBuilder normalized = new StringBuilder(lower.length());
        for (int i = 0; i < lower.length(); i++) {
            char current = lower.charAt(i);
            if (Character.isLetterOrDigit(current)) {
                normalized.append(current);
            }
        }
        return normalized.toString();
    }

    private String[] resolveParameterNames(MethodSignature signature, Method method) {
        String[] discovered = signature.getParameterNames();
        if (discovered != null && discovered.length == method.getParameterCount()) {
            return discovered;
        }
        java.lang.reflect.Parameter[] parameters = method.getParameters();
        String[] names = new String[parameters.length];
        for (int i = 0; i < parameters.length; i++) {
            names[i] = parameters[i].getName();
        }
        return names;
    }

    private String truncate(String content) {
        if (content.length() <= MAX_LOG_CONTENT_LENGTH) {
            return content;
        }
        return content.substring(0, MAX_LOG_CONTENT_LENGTH) + "...";
    }

    private String getIpAddress(HttpServletRequest request) {
        // 生产反向代理会覆盖 X-Real-IP；X-Forwarded-For 首段可由客户端预置，
        // 不能作为安全审计中的第一可信来源。
        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    /**
     * Operation log event for async persistence
     */
    public static class OperLogEvent extends org.springframework.context.ApplicationEvent {
        private final Map<String, Object> logData;

        public OperLogEvent(Map<String, Object> logData) {
            super(logData);
            this.logData = logData;
        }

        public Map<String, Object> getLogData() {
            return logData;
        }
    }
}
