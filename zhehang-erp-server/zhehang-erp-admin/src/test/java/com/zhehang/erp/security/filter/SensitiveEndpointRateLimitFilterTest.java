package com.zhehang.erp.security.filter;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SensitiveEndpointRateLimitFilterTest {

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private FilterChain filterChain;

    private SensitiveEndpointRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new SensitiveEndpointRateLimitFilter(redisTemplate);
    }

    @Test
    void blocksLoginWhenIpBucketExceedsLimit() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(31L);
        MockHttpServletResponse response = run("POST", "/auth/login");

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getContentAsString()).contains("请求过于频繁");
        verify(filterChain, never()).doFilter(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void rateLimitsRecordingTicketEndpoint() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);
        MockHttpServletResponse response = run("GET", "/call-record/recordings/42/play-ticket");

        assertThat(response.getStatus()).isEqualTo(200);
        verify(filterChain).doFilter(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void failsClosedWhenLimiterIsUnavailable() throws Exception {
        when(redisTemplate.opsForValue()).thenThrow(new IllegalStateException("redis unavailable"));
        MockHttpServletResponse response = run("POST", "/seal/public/submit");

        assertThat(response.getStatus()).isEqualTo(503);
        verify(filterChain, never()).doFilter(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void leavesOrdinaryAuthenticatedEndpointsUntouched() throws Exception {
        MockHttpServletResponse response = run("GET", "/crm/lead/list");

        assertThat(response.getStatus()).isEqualTo(200);
        verify(filterChain).doFilter(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    private MockHttpServletResponse run(String method, String servletPath) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, "/api" + servletPath);
        request.setContextPath("/api");
        request.setServletPath(servletPath);
        request.setRemoteAddr("192.0.2.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, filterChain);
        return response;
    }
}
