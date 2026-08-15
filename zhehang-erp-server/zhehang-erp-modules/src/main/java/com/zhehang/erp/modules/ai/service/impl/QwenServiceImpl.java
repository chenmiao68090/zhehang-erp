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
@ConditionalOnProperty(name = "ai.provider", havingValue = "qwen")
public class QwenServiceImpl implements AiService {

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate;

    @Autowired
    public QwenServiceImpl(AiConfig aiConfig) {
        this(aiConfig, AiHttpClientFactory.create(aiConfig));
    }

    QwenServiceImpl(AiConfig aiConfig, RestTemplate restTemplate) {
        this.aiConfig = aiConfig;
        this.restTemplate = restTemplate;
    }

    @Override
    public String chat(String prompt, Map<String, Object> context) {
        try {
            String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + aiConfig.getQwen().getApiKey());

            Map<String, Object> body = new HashMap<>();
            body.put("model", aiConfig.getQwen().getModel());
            Map<String, Object> input = new HashMap<>();
            List<Map<String, String>> messages = new ArrayList<>();
            if (context != null && context.containsKey("systemPrompt")) {
                messages.add(Map.of("role", "system", "content", context.get("systemPrompt").toString()));
            }
            messages.add(Map.of("role", "user", "content", prompt));
            input.put("messages", messages);
            body.put("input", input);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map responseBody = response.getBody();
            if (responseBody != null) {
                Object outputValue = responseBody.get("output");
                if (outputValue instanceof Map<?, ?> output
                        && output.get("text") instanceof String text
                        && !text.isBlank()) {
                    return text;
                }
            }
            throw new BusinessException(SERVICE_UNAVAILABLE_MESSAGE);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Qwen call failed", e);
            throw new BusinessException(SERVICE_UNAVAILABLE_MESSAGE);
        }
    }

    @Override
    public String getProviderName() {
        return "qwen";
    }
}
