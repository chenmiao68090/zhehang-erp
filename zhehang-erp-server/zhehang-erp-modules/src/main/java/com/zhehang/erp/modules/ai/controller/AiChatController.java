package com.zhehang.erp.modules.ai.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.service.AiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiService aiService;

    @PostMapping("/chat")
    public R<AiChatResponse> chat(@RequestBody ChatRequest request) {
        String message = request.getMessage();
        if (!StringUtils.hasText(message) || message.length() > 4000) {
            throw new BusinessException("消息不能为空且不能超过4000字");
        }
        String reply = aiService.chat(message.trim(), request.getSafeContextMap());
        AiChatResponse response = new AiChatResponse();
        response.setReply(reply);
        response.setConversationId(request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString());
        return R.ok(response);
    }

    @Data
    public static class ChatRequest {
        private String message;
        private String context;
        private String conversationId;
        private String prompt;
        private Map<String, Object> contextMap;

        public Map<String, Object> getSafeContextMap() {
            if (contextMap != null) {
                Map<String, Object> safe = new java.util.LinkedHashMap<>(contextMap);
                safe.remove("systemPrompt");
                safe.remove("developerPrompt");
                safe.remove("instructions");
                return safe;
            }
            if (context != null) return Map.of("context", context);
            return null;
        }

        public String getMessage() {
            return message != null ? message : prompt;
        }
    }

    @Data
    public static class AiChatResponse {
        private String reply;
        private String conversationId;
    }
}
