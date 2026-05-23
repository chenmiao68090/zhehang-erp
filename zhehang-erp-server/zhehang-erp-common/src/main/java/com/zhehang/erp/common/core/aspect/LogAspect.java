package com.zhehang.erp.common.core.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
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
import java.util.Map;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

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

            String operator = SecurityUtils.getCurrentUsername();
            String module = logAnnotation.module();
            String operationType = logAnnotation.type().name();
            String methodName = joinPoint.getTarget().getClass().getName() + "." + method.getName();
            String ip = request != null ? getIpAddress(request) : "unknown";
            String requestUri = request != null ? request.getRequestURI() : "";
            String requestMethod = request != null ? request.getMethod() : "";

            long costTime = System.currentTimeMillis() - START_TIME.get();

            // Build log params
            String params = "";
            try {
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    params = objectMapper.writeValueAsString(args);
                    if (params.length() > 2000) {
                        params = params.substring(0, 2000) + "...";
                    }
                }
            } catch (Exception ex) {
                params = "serialization error";
            }

            String resultStr = "";
            if (result != null) {
                try {
                    resultStr = objectMapper.writeValueAsString(result);
                    if (resultStr.length() > 2000) {
                        resultStr = resultStr.substring(0, 2000) + "...";
                    }
                } catch (Exception ex) {
                    resultStr = "serialization error";
                }
            }

            int status = e == null ? 0 : 1;
            String errorMsg = e != null ? e.getMessage() : "";

            log.info("[OperationLog] operator={}, module={}, type={}, method={}, uri={} {}, ip={}, status={}, cost={}ms",
                    operator, module, operationType, methodName, requestMethod, requestUri, ip, status, costTime);

            // Persist to database asynchronously
            try {
                Map<String, Object> logData = Map.ofEntries(
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
                );
                // Publish event for async log persistence
                applicationContext.publishEvent(new OperLogEvent(logData));
            } catch (Exception ex) {
                log.warn("Failed to publish log event: {}", ex.getMessage());
            }
        } catch (Exception ex) {
            log.error("Operation log recording failed: {}", ex.getMessage());
        } finally {
            START_TIME.remove();
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
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
