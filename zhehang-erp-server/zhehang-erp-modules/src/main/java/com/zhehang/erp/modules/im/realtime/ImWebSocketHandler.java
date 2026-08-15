package com.zhehang.erp.modules.im.realtime;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ImWebSocketHandler extends TextWebSocketHandler {
    private final ImRealtimeGateway gateway;
    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        gateway.register(session);
        gateway.send(session, "connection.ready", Map.of(
                "userId", session.getAttributes().get("imUserId"),
                "serverTime", Instant.now().toString()));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload;
        try {
            payload = objectMapper.readValue(message.getPayload(), new TypeReference<>() {});
        } catch (Exception e) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        String type = String.valueOf(payload.getOrDefault("type", ""));
        if ("ping".equals(type)) {
            if (!gateway.loginStillValid(session)) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }
            gateway.touch(session);
            gateway.send(session, "pong", Map.of("at", Instant.now().toString()));
        } else if ("ack".equals(type)) {
            if (!gateway.loginStillValid(session)) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }
            gateway.touch(session);
            session.getAttributes().put("lastAckEventId", payload.get("eventId"));
            session.getAttributes().put("lastAckAt", Instant.now().toString());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        gateway.unregister(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        gateway.unregister(session);
        if (session.isOpen()) {
            try { session.close(CloseStatus.SERVER_ERROR); } catch (IOException ignored) { }
        }
    }
}
