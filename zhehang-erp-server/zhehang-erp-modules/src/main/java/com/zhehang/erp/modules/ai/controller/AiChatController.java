package com.zhehang.erp.modules.ai.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.ai.service.AiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiService aiService;

    @PostMapping("/chat")
    public R<AiChatResponse> chat(@RequestBody ChatRequest request) {
        String reply;
        try {
            reply = aiService.chat(request.getMessage(), request.getContextMap());
        } catch (Exception e) {
            log.warn("AI service call failed, using fallback: {}", e.getMessage());
            reply = generateFallbackReply(request.getMessage());
        }
        AiChatResponse response = new AiChatResponse();
        response.setReply(reply);
        response.setConversationId(request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString());
        return R.ok(response);
    }

    @GetMapping("/chat/history")
    public R<List<AiChatHistory>> getHistory() {
        List<AiChatHistory> history = new ArrayList<>();
        history.add(new AiChatHistory("conv_1", "数据分析对话", "帮我分析本月销售数据",
                LocalDateTime.now().minusHours(2).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));
        history.add(new AiChatHistory("conv_2", "客户跟进建议", "分析客户跟进情况",
                LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));
        return R.ok(history);
    }

    private String generateFallbackReply(String message) {
        if (message == null) return "您好，有什么可以帮助您的？";
        if (message.contains("待办") || message.contains("任务"))
            return "📋 您可以在「工作流-待办任务」中查看和处理待办事项。AI 智能分析功能正在接入中！";
        if (message.contains("销售") || message.contains("业绩"))
            return "📊 您可以在「报表中心」查看详细的销售报表。AI 智能分析功能正在接入中！";
        if (message.contains("客户"))
            return "🤝 您可以在「客户关系」模块查看客户信息和跟进记录。AI 智能分析功能正在接入中！";
        return "收到您的问题：\"" + message + "\"。AI 功能正在接入中，敬请期待！";
    }

    @Data
    public static class ChatRequest {
        private String message;
        private String context;
        private String conversationId;
        private String prompt;
        private Map<String, Object> contextMap;

        public Map<String, Object> getContextMap() {
            if (contextMap != null) return contextMap;
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

    @Data
    public static class AiChatHistory {
        private String id;
        private String title;
        private String lastMessage;
        private String updateTime;

        public AiChatHistory() {}
        public AiChatHistory(String id, String title, String lastMessage, String updateTime) {
            this.id = id; this.title = title; this.lastMessage = lastMessage; this.updateTime = updateTime;
        }
    }
}
