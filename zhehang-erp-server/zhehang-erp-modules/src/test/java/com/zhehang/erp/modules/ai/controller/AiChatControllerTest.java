package com.zhehang.erp.modules.ai.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.service.AiService;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiChatControllerTest {

    @Test
    void successfulProviderReplyRemainsSuccessful() {
        AiService aiService = mock(AiService.class);
        AiChatController controller = new AiChatController(aiService);
        AiChatController.ChatRequest request = new AiChatController.ChatRequest();
        request.setMessage("经营情况如何");
        request.setConversationId("conversation-1");
        request.setContextMap(Map.of("systemPrompt", "只引用真实数据"));
        when(aiService.chat(eq("经营情况如何"), any())).thenReturn("真实回答");

        R<AiChatController.AiChatResponse> result = controller.chat(request);

        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData().getReply()).isEqualTo("真实回答");
        assertThat(result.getData().getConversationId()).isEqualTo("conversation-1");
        verify(aiService).chat(eq("经营情况如何"), org.mockito.ArgumentMatchers.argThat(context ->
                context != null && !context.containsKey("systemPrompt")));
    }

    @Test
    void providerFailurePropagatesInsteadOfBecomingFallbackSuccess() {
        AiService aiService = mock(AiService.class);
        AiChatController controller = new AiChatController(aiService);
        AiChatController.ChatRequest request = new AiChatController.ChatRequest();
        request.setMessage("经营情况如何");
        when(aiService.chat("经营情况如何", null))
                .thenThrow(new BusinessException(AiService.SERVICE_UNAVAILABLE_MESSAGE));

        assertThatThrownBy(() -> controller.chat(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(AiService.SERVICE_UNAVAILABLE_MESSAGE);
    }
}
