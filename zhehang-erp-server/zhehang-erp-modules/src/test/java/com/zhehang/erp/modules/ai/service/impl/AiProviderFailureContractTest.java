package com.zhehang.erp.modules.ai.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.config.AiConfig;
import com.zhehang.erp.modules.ai.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiProviderFailureContractTest {

    @Test
    void openAiKeepsSuccessfulReplyUnchanged() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of(
                        "choices", List.of(Map.of("message", Map.of("content", "真实回答"))))));

        String reply = new OpenAiServiceImpl(config(), restTemplate).chat("问题", null);

        assertThat(reply).isEqualTo("真实回答");
    }

    @Test
    void openAiTransportFailureIsNotReturnedAsAnswer() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new IllegalStateException("provider offline"));

        assertUnavailable(() -> new OpenAiServiceImpl(config(), restTemplate).chat("问题", null));
    }

    @Test
    void openAiMalformedResponseIsNotReturnedAsAnswer() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("choices", List.of())));

        assertUnavailable(() -> new OpenAiServiceImpl(config(), restTemplate).chat("问题", null));
    }

    @Test
    void qwenKeepsSuccessfulReplyUnchanged() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("output", Map.of("text", "真实回答"))));

        String reply = new QwenServiceImpl(config(), restTemplate).chat("问题", null);

        assertThat(reply).isEqualTo("真实回答");
    }

    @Test
    void qwenTransportFailureIsNotReturnedAsAnswer() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new IllegalStateException("provider offline"));

        assertUnavailable(() -> new QwenServiceImpl(config(), restTemplate).chat("问题", null));
    }

    @Test
    void qwenMalformedResponseIsNotReturnedAsAnswer() {
        RestTemplate restTemplate = mock(RestTemplate.class);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("output", Map.of())));

        assertUnavailable(() -> new QwenServiceImpl(config(), restTemplate).chat("问题", null));
    }

    private void assertUnavailable(Runnable action) {
        assertThatThrownBy(action::run)
                .isInstanceOf(BusinessException.class)
                .hasMessage(AiService.SERVICE_UNAVAILABLE_MESSAGE);
    }

    private AiConfig config() {
        AiConfig config = new AiConfig();
        config.getOpenai().setApiKey("test-key");
        config.getOpenai().setBaseUrl("https://example.test/v1");
        config.getQwen().setApiKey("test-key");
        return config;
    }
}
