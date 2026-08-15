package com.zhehang.erp.common.config;

import com.zhehang.erp.common.core.interceptor.ImpersonationGuardInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 注册员工视角的集中后端只读闸门。 */
@Configuration
@RequiredArgsConstructor
public class ImpersonationWebMvcConfig implements WebMvcConfigurer {

    private final ImpersonationGuardInterceptor impersonationGuardInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(impersonationGuardInterceptor)
                .addPathPatterns("/**")
                .order(Ordered.HIGHEST_PRECEDENCE);
    }
}
