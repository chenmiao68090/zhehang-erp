package com.zhehang.erp.modules.ai.service.impl;

import com.zhehang.erp.modules.ai.config.AiConfig;
import com.zhehang.erp.modules.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ai.provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiServiceImpl implements AiService {

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate = new RestTemplate();

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
            if (response.getBody() != null) {
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "AI service unavailable";
        } catch (Exception e) {
            log.error("OpenAI call failed: {}", e.getMessage());
            return "AI service error: " + e.getMessage();
        }
    }

    @Override
    public String getProviderName() {
        return "openai";
    }
}