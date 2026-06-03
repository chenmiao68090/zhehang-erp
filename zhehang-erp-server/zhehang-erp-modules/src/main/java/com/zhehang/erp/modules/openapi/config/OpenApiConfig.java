package com.zhehang.erp.modules.openapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Knife4j / OpenAPI 文档配置
 * 同时声明 JWT 与 AppKey 两套鉴权方案
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("浙杭集团 ERP API 文档")
                        .description("浙杭集团企业资源管理系统 OpenAPI 文档（含管理后台 + 开放API）")
                        .version("1.0.0")
                        .contact(new Contact().name("浙杭集团").email("dev@zhehang.com"))
                        .license(new License().name("Apache 2.0")))
                .components(new Components()
                        .addSecuritySchemes("JWT", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT 认证 - 从 /auth/login 获取 accessToken"))
                        .addSecuritySchemes("AppKey", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-App-Key")
                                .description("开放API 应用Key 认证")))
                .addSecurityItem(new SecurityRequirement().addList("JWT"))
                .addSecurityItem(new SecurityRequirement().addList("AppKey"));
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
