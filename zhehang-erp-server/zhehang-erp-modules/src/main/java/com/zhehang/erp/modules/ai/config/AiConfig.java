package com.zhehang.erp.modules.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiConfig {
    private String provider = "openai";
    /** 外部模型建连最多等待5秒，可通过环境变量调整（代码限制1-60秒）。 */
    private int connectTimeoutMillis = 5_000;
    /** 外部模型响应最多等待30秒，可通过环境变量调整（代码限制5-120秒）。 */
    private int readTimeoutMillis = 30_000;
    private OpenAiProperties openai = new OpenAiProperties();
    private QwenProperties qwen = new QwenProperties();

    @Data
    public static class OpenAiProperties {
        private String apiKey;
        private String baseUrl = "https://api.openai.com/v1";
        private String model = "gpt-4";
        /** 仅服务端用于真实录音转写，录音地址与密钥均不得下发浏览器。 */
        private String transcriptionModel = "gpt-4o-mini-transcribe";
    }

    @Data
    public static class QwenProperties {
        private String apiKey;
        private String model = "qwen-turbo";
    }
}
