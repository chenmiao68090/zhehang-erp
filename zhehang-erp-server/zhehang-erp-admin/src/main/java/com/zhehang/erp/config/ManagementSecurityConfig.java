package com.zhehang.erp.config;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Actuator 管理端口（management.server.port=8081）的独立安全链。
 *
 * 管理端口虽然是独立的 Web 上下文，但仍复用主上下文的 FilterChainProxy，
 * 因此原先会落到 SecurityConfig 的 anyRequest().authenticated()，健康检查被判 401。
 * 这里单独放行，优先级高于主链（主链未标注 @Order，为最低优先级）。
 *
 * 安全性：EndpointRequest 在 management.server.port 与业务端口不同时，
 * 只对管理端口所属的子上下文生效；走 8080 的 /actuator/** 依旧被主链拦下。
 * 而 8081 在 docker-compose 里只绑定 127.0.0.1，不经 nginx，也不暴露公网。
 */
@Configuration
public class ManagementSecurityConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain managementSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .csrf(AbstractHttpConfigurer::disable)
            // 运维探针无需会话，避免每次探测都新建 JSESSIONID
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
