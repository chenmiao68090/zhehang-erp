package com.zhehang.erp.modules.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiConfig {
    private String provider = "openai";
    private OpenAiProperties openai = new OpenAiProperties();
    private QwenProperties qwen = new QwenProperties();

    @Data
    public static class OpenAiProperties {
        private String apiKey;
        private String baseUrl = "https://api.openai.com/v1";
        private String model = "gpt-4";
    }

    @Data
    public static class QwenProperties {
        private String apiKey;
        private String model = "qwen-turbo";
    }
}