package com.zhehang.erp.modules.ai.service.impl;

import com.zhehang.erp.modules.ai.config.AiConfig;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/** 为外部 AI 调用提供有界等待，避免网络半开时业务请求长期阻塞。 */
final class AiHttpClientFactory {

    private AiHttpClientFactory() {}

    static RestTemplate create(AiConfig config) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(bounded(config.getConnectTimeoutMillis(), 1_000, 60_000));
        factory.setReadTimeout(bounded(config.getReadTimeoutMillis(), 5_000, 120_000));
        return new RestTemplate(factory);
    }

    private static int bounded(int value, int minimum, int maximum) {
        return Math.max(minimum, Math.min(value, maximum));
    }
}
