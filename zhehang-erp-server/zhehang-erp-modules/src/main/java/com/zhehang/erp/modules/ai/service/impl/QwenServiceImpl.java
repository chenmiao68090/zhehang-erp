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
@ConditionalOnProperty(name = "ai.provider", havingValue = "qwen")
public class QwenServiceImpl implements AiService {

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate = new RestTemplate();

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
            messages.add(Map.of("role", "user", "content", prompt));
            input.put("messages", messages);
            body.put("input", input);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getBody() != null) {
                Map output = (Map) response.getBody().get("output");
                if (output != null) {
                    return (String) output.get("text");
                }
            }
            return "AI service unavailable";
        } catch (Exception e) {
            log.error("Qwen call failed: {}", e.getMessage());
            return "AI service error: " + e.getMessage();
        }
    }

    @Override
    public String getProviderName() {
        return "qwen";
    }
}