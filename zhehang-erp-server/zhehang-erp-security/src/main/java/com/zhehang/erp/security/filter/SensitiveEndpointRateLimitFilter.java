package com.zhehang.erp.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

/** 对登录、外部表单及媒体票据/流进行独立限流，不依赖业务 Controller 是否被调用。 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SensitiveEndpointRateLimitFilter extends OncePerRequestFilter {
    private static final int HTTP_TOO_MANY_REQUESTS = 429;
    private static final List<Rule> RULES = List.of(
            new Rule("POST", "/auth/login", 30, Duration.ofMinutes(1), true),
            new Rule("POST", "/seal/public/token", 30, Duration.ofMinutes(1), true),
            new Rule("GET", "/seal/public/options", 60, Duration.ofMinutes(1), false),
            new Rule("POST", "/seal/public/submit", 15, Duration.ofMinutes(1), true),
            new Rule("GET", "/hrm/onboarding/public/", 90, Duration.ofMinutes(1), false),
            new Rule("POST", "/hrm/onboarding/public/", 20, Duration.ofMinutes(1), true),
            new Rule("GET", "/hrm/training/courseware/materials/", 120, Duration.ofMinutes(1), true),
            new Rule("GET", "/hrm/training/courseware/video/stream/", 600, Duration.ofMinutes(1), false),
            new Rule("GET", "/call-record/recordings/stream/", 300, Duration.ofMinutes(1), false),
            new Rule("GET", "/call-record/recordings/", 120, Duration.ofMinutes(1), true),
            // 前端错误上报免鉴权且直写日志，必须限流；本身不再写审计日志避免重复噪声。
            new Rule("POST", "/frontend-error", 60, Duration.ofMinutes(1), false)
    );

    private final StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        String path = request.getServletPath();
        Rule rule = RULES.stream().filter(item -> item.matches(request.getMethod(), path)).findFirst().orElse(null);
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String actor = hash(clientIp(request));
        String bucket = Long.toString(System.currentTimeMillis() / rule.window().toMillis());
        String key = "security:rate:" + rule.key() + ":" + actor + ":" + bucket;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1L) redisTemplate.expire(key, rule.window().plusSeconds(5));
            if (count != null && count > rule.limit()) {
                log.warn("Sensitive endpoint rate limited endpoint={} actor={}", rule.key(), actor);
                reject(response, HTTP_TOO_MANY_REQUESTS, "请求过于频繁，请稍后再试");
                return;
            }
        } catch (RuntimeException e) {
            log.error("Sensitive endpoint limiter unavailable endpoint={} actor={}", rule.key(), actor);
            reject(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE, "安全校验服务暂时不可用，请稍后重试");
            return;
        }
        if (rule.audit()) log.info("Sensitive endpoint accessed endpoint={} actor={}", rule.key(), actor);
        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Real-IP");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.trim();
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest, 0, 8);
        } catch (Exception e) {
            return "unavailable";
        }
    }

    private void reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"code\":" + status + ",\"message\":\"" + message + "\"}");
    }

    private record Rule(String method, String path, int limit, Duration window, boolean audit) {
        boolean matches(String requestMethod, String requestPath) {
            if (!method.equalsIgnoreCase(requestMethod)) return false;
            if (path.endsWith("/")) return requestPath.startsWith(path);
            return requestPath.equals(path);
        }

        String key() {
            return method.toLowerCase(Locale.ROOT) + ":" + path.replace('/', '_');
        }
    }
}
