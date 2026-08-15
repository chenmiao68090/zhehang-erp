package com.zhehang.erp.modules.ai.service.impl;

import com.zhehang.erp.modules.ai.config.AiConfig;
import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.common.core.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiServiceImpl implements AiService {

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate;

    @Autowired
    public OpenAiServiceImpl(AiConfig aiConfig) {
        this(aiConfig, AiHttpClientFactory.create(aiConfig));
    }

    OpenAiServiceImpl(AiConfig aiConfig, RestTemplate restTemplate) {
        this.aiConfig = aiConfig;
        this.restTemplate = restTemplate;
    }

    @Override
    public String chat(String prompt, Map<String, Object> context) {
        try {
            String url = aiConfig.getOpenai().getBaseUrl() + "/chat/completions";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiConfig.getOpenai().getApiKey());

            Map<String, Object> body = new HashMap<>();
            body.put("model", aiConfig.getOpenai().getModel());
            List<Map<String, String>> messages = new ArrayList<>();
            if (context != null && context.containsKey("systemPrompt")) {
                messages.add(Map.of("role", "system", "content", context.get("systemPrompt").toString()));
            }
            messages.add(Map.of("role", "user", "content", prompt));
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map responseBody = response.getBody();
            if (responseBody != null) {
                Object choicesValue = responseBody.get("choices");
                if (choicesValue instanceof List<?> choices && !choices.isEmpty()
                        && choices.get(0) instanceof Map<?, ?> choice
                        && choice.get("message") instanceof Map<?, ?> message
                        && message.get("content") instanceof String content
                        && !content.isBlank()) {
                    return content;
                }
            }
            throw new BusinessException(SERVICE_UNAVAILABLE_MESSAGE);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI call failed", e);
            throw new BusinessException(SERVICE_UNAVAILABLE_MESSAGE);
        }
    }

    @Override
    public String getProviderName() {
        return "openai";
    }
}
