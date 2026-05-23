package com.zhehang.erp.modules.openapi.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

/**
 * 开放API限流过滤器（Redis令牌桶）
 * 按 app_key 限流，每秒限制 N 次（从 openapi_app.rate_limit 读取）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenapiRateLimitFilter implements Filter {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Redis Lua 令牌桶脚本
     * KEYS[1] = 令牌桶 key
     * ARGV[1] = 每秒令牌数 (rate_limit)
     * ARGV[2] = 当前时间戳(秒)
     * 返回 1 表示允许, 0 表示被限流
     */
    private static final String LUA_SCRIPT = """
            local key = KEYS[1]
            local rate = tonumber(ARGV[1])
            local now = tonumber(ARGV[2])
            local bucket = redis.call('hmget', key, 'tokens', 'last_time')
            local tokens = tonumber(bucket[1])
            local last_time = tonumber(bucket[2])
            if tokens == nil then
                tokens = rate
                last_time = now
            end
            local elapsed = math.max(0, now - last_time)
            tokens = math.min(rate, tokens + elapsed * rate)
            if tokens < 1 then
                return 0
            end
            tokens = tokens - 1
            redis.call('hmset', key, 'tokens', tokens, 'last_time', now)
            redis.call('expire', key, 60)
            return 1
            """;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String appKey = (String) request.getAttribute("openapi_app_key");
        Integer rateLimit = (Integer) request.getAttribute("openapi_rate_limit");

        if (appKey == null || rateLimit == null) {
            // 没有通过签名过滤器设置的属性，直接放行（不应发生）
            chain.doFilter(request, response);
            return;
        }

        String redisKey = "openapi:ratelimit:" + appKey;
        long nowSeconds = System.currentTimeMillis() / 1000;

        DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);
        Long result = redisTemplate.execute(script,
                Collections.singletonList(redisKey),
                rateLimit, nowSeconds);

        if (result == null || result == 0L) {
            log.warn("[OpenAPI限流] appKey={} 请求被限流, rateLimit={}/s", appKey, rateLimit);
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                    R.fail(429, "请求过于频繁，请稍后再试")));
            return;
        }

        chain.doFilter(request, response);
    }
}
