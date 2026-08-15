package com.zhehang.erp.security.config;

import com.zhehang.erp.security.filter.JwtAuthenticationFilter;
import com.zhehang.erp.security.filter.SensitiveEndpointRateLimitFilter;
import com.zhehang.erp.security.handler.AuthenticationEntryPointImpl;
import com.zhehang.erp.security.handler.LogoutSuccessHandlerImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {SecurityConfig.class, SecurityConfigFilterChainTest.TestBeans.class})
@TestPropertySource(properties = "security.cors.allowed-origins=https://zhehangjituan.xn--fiqs8s")
class SecurityConfigFilterChainTest {

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    static class TestBeans {
        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter() {
            return mock(JwtAuthenticationFilter.class);
        }

        @Bean
        SensitiveEndpointRateLimitFilter sensitiveEndpointRateLimitFilter() {
            return mock(SensitiveEndpointRateLimitFilter.class);
        }

        @Bean
        AuthenticationEntryPointImpl authenticationEntryPoint() {
            return mock(AuthenticationEntryPointImpl.class);
        }

        @Bean
        LogoutSuccessHandlerImpl logoutSuccessHandler() {
            return mock(LogoutSuccessHandlerImpl.class);
        }
    }

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    private SensitiveEndpointRateLimitFilter sensitiveEndpointRateLimitFilter;

    @Autowired
    private FilterChainProxy filterChainProxy;

    @Test
    void buildsChainWithRateLimiterBeforeJwtFilter() {
        List<?> filters = filterChainProxy.getFilterChains().get(0).getFilters();

        int rateLimitIndex = filters.indexOf(sensitiveEndpointRateLimitFilter);
        int jwtIndex = filters.indexOf(jwtAuthenticationFilter);
        assertThat(rateLimitIndex).isGreaterThanOrEqualTo(0);
        assertThat(jwtIndex).isGreaterThan(rateLimitIndex);
    }
}
