package com.zhehang.erp.modules.im.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImRealtimeGatewaySecurityTest {

    @Mock
    private TokenService tokenService;
    @Mock
    private WebSocketSession session;

    private ImRealtimeGateway gateway;
    private Map<String, Object> attributes;

    @BeforeEach
    void setUp() {
        gateway = new ImRealtimeGateway(new ObjectMapper(), tokenService);
        attributes = new HashMap<>();
        attributes.put("imUserId", 10L);
        attributes.put("imTenantId", 1L);
        attributes.put("imToken", "registered-token");
        when(session.getAttributes()).thenReturn(attributes);
        when(session.isOpen()).thenReturn(true);
        when(tokenService.getLoginUser("registered-token")).thenReturn(new LoginUser());
        gateway.register(session);
        clearInvocations(session, tokenService);
    }

    @Test
    void publishClosesRegisteredSessionWhenLoginSnapshotIsNoLongerValid() throws Exception {
        when(tokenService.getLoginUser("registered-token")).thenReturn(null);

        gateway.publish("message.created", List.of(10L), Map.of("messageId", 99L));

        verify(session).close(CloseStatus.POLICY_VIOLATION);
        verify(session, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void publishSendsOneMessageWhenRegisteredSessionStillHasValidLoginSnapshot() throws Exception {
        gateway.publish("message.created", List.of(10L), Map.of("messageId", 99L));

        verify(session, times(1)).sendMessage(any(TextMessage.class));
        verify(session, never()).close(any(CloseStatus.class));
    }

    @Test
    void unregisteringOneOfTwoSessionsKeepsUserOnlineUntilLastSessionLeaves() {
        TokenService validTokenService = new TokenService(null, null) {
            @Override
            public LoginUser getLoginUser(String token) {
                return new LoginUser();
            }
        };
        ImRealtimeGateway multiSessionGateway = new ImRealtimeGateway(new ObjectMapper(), validTokenService);
        WebSocketSession secondSession = mock(WebSocketSession.class);
        Map<String, Object> secondAttributes = new HashMap<>();
        secondAttributes.put("imUserId", 10L);
        secondAttributes.put("imTenantId", 1L);
        secondAttributes.put("imToken", "second-token");
        when(secondSession.getAttributes()).thenReturn(secondAttributes);
        when(session.isOpen()).thenReturn(true);
        when(secondSession.isOpen()).thenReturn(true);
        multiSessionGateway.register(session);
        multiSessionGateway.register(secondSession);

        assertTrue(multiSessionGateway.isOnline(10L));

        multiSessionGateway.unregister(session);
        assertTrue(multiSessionGateway.isOnline(10L));

        multiSessionGateway.unregister(secondSession);
        assertFalse(multiSessionGateway.isOnline(10L));
    }

    @Test
    void presenceBroadcastsWithinTenantOnlyAndLastSessionControlsOfflineState() throws Exception {
        TokenService validTokenService = new TokenService(null, null) {
            @Override
            public LoginUser getLoginUser(String token) {
                return new LoginUser();
            }
        };
        ImRealtimeGateway presenceGateway = new ImRealtimeGateway(new ObjectMapper(), validTokenService);
        WebSocketSession observer = openSession(20L, 1L, "observer-token");
        WebSocketSession outsider = openSession(30L, 2L, "outsider-token");
        WebSocketSession first = openSession(10L, 1L, "first-token");
        WebSocketSession second = openSession(10L, 1L, "second-token");
        presenceGateway.register(observer);
        presenceGateway.register(outsider);
        clearInvocations(observer, outsider);

        presenceGateway.register(first);

        verify(observer).sendMessage(argThat(message -> message instanceof TextMessage text
                && presencePayload(text, 10L, true)));
        verify(outsider, never()).sendMessage(argThat(message -> message instanceof TextMessage text
                && presencePayload(text, 10L, true)));
        clearInvocations(observer, outsider, first);

        presenceGateway.register(second);
        presenceGateway.unregister(first);

        verify(observer, never()).sendMessage(argThat(message -> message instanceof TextMessage text
                && presencePayload(text, 10L, false)));
        assertTrue(presenceGateway.isOnline(10L));

        presenceGateway.unregister(second);

        verify(observer).sendMessage(argThat(message -> message instanceof TextMessage text
                && presencePayload(text, 10L, false)));
        assertFalse(presenceGateway.isOnline(10L));
    }

    @Test
    void staleClientHeartbeatMakesSessionOfflineAndClosesIt() throws Exception {
        attributes.put("imLastClientPingAt", System.currentTimeMillis() - 120_000L);

        assertFalse(gateway.isOnline(10L));
        gateway.validateSessions();

        verify(session).close(argThat(status -> status.getCode() == 4001));
        assertFalse(gateway.isOnline(10L));
    }

    private WebSocketSession openSession(Long userId, Long tenantId, String token) {
        WebSocketSession mockSession = mock(WebSocketSession.class);
        Map<String, Object> sessionAttributes = new HashMap<>();
        sessionAttributes.put("imUserId", userId);
        sessionAttributes.put("imTenantId", tenantId);
        sessionAttributes.put("imToken", token);
        when(mockSession.getAttributes()).thenReturn(sessionAttributes);
        when(mockSession.isOpen()).thenReturn(true);
        return mockSession;
    }

    private boolean presencePayload(TextMessage message, Long userId, boolean online) {
        String payload = message.getPayload();
        return payload.contains("\"type\":\"presence.changed\"")
                && payload.contains("\"userId\":" + userId)
                && payload.contains("\"online\":" + online);
    }
}
