package com.zhehang.erp.security.config;

import com.zhehang.erp.security.filter.JwtAuthenticationFilter;
import com.zhehang.erp.security.filter.SensitiveEndpointRateLimitFilter;
import com.zhehang.erp.security.handler.AuthenticationEntryPointImpl;
import com.zhehang.erp.security.handler.LogoutSuccessHandlerImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final SensitiveEndpointRateLimitFilter sensitiveEndpointRateLimitFilter;
    private final AuthenticationEntryPointImpl authenticationEntryPoint;
    private final LogoutSuccessHandlerImpl logoutSuccessHandler;

    @Value("${security.cors.allowed-origins:https://zhehangjituan.xn--fiqs8s}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint))
            .headers(headers -> headers
                    .contentSecurityPolicy(csp -> csp.policyDirectives(
                            "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"))
                    .frameOptions(frame -> frame.deny())
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                    .httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true).preload(true).maxAgeInSeconds(Duration.ofDays(365).toSeconds())))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/auth/login",
                        "/auth/refresh",
                        "/auth/captcha",
                        "/auth/first-password",
                        "/auth/mfa/enroll",
                        "/auth/mfa/confirm",
                        "/auth/mfa/verify"
                ).permitAll()
                .requestMatchers("/hrm/onboarding/public/**").permitAll()
                // 原视频文件不公开；这里只放行短时随机票据保护的 Range 流端点。
                .requestMatchers("/hrm/training/courseware/video/stream/**").permitAll()
                // 云客原始地址不下发；这里只放行短时票据、UA绑定的录音代理流端点。
                .requestMatchers("/call-record/recordings/stream/**").permitAll()
                // 刻章自助只放行两个文字表单端点，Controller 再校验请求头票据；签发票据仍须登录。
                .requestMatchers(HttpMethod.GET, "/seal/public/options").permitAll()
                .requestMatchers(HttpMethod.POST, "/seal/public/submit").permitAll()
                // WebSocket 握手使用登录后签发的一次性票据，握手拦截器会再次校验 JWT 登录态。
                .requestMatchers("/ws/im").permitAll()
                // 登录页/未登录状态也会抛错，前端错误上报必须免鉴权；只放行 POST，限流器按 IP 兜住刷量。
                // Actuator 另绑 8081 端口（独立管理上下文，不走本过滤器链，也不经 nginx），故无需在此放行。
                .requestMatchers(HttpMethod.POST, "/frontend-error").permitAll()
                .requestMatchers("/doc.html", "/swagger-resources/**", "/webjars/**", "/v3/api-docs/**").authenticated()
                .requestMatchers("/favicon.ico").permitAll()
                .anyRequest().authenticated()
            )
            .logout(logout -> logout.logoutUrl("/auth/logout").logoutSuccessHandler(logoutSuccessHandler))
            // 先把自定义 JWT 过滤器登记到标准链，再以它为锚点放置限流器。
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(sensitiveEndpointRateLimitFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim).filter(value -> !value.isBlank()).distinct().toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
