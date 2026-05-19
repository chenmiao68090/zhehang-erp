package com.zhehang.erp.modules.openapi.config;

import com.zhehang.erp.modules.openapi.filter.OpenapiRateLimitFilter;
import com.zhehang.erp.modules.openapi.filter.OpenapiSignFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 开放API过滤器注册配置
 * 签名过滤器 -> 限流过滤器 的顺序执行
 */
@Configuration
public class OpenapiFilterConfig {

    @Bean
    public FilterRegistrationBean<OpenapiSignFilter> openapiSignFilterRegistration(OpenapiSignFilter filter) {
        FilterRegistrationBean<OpenapiSignFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/openapi/*");
        registration.setOrder(1);
        registration.setName("openapiSignFilter");
        return registration;
    }

    @Bean
    public FilterRegistrationBean<OpenapiRateLimitFilter> openapiRateLimitFilterRegistration(OpenapiRateLimitFilter filter) {
        FilterRegistrationBean<OpenapiRateLimitFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/openapi/*");
        registration.setOrder(2);
        registration.setName("openapiRateLimitFilter");
        return registration;
    }
}
