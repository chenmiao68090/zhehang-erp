package com.zhehang.erp.modules.im.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@RequiredArgsConstructor
public class ImRealtimeGateway implements ImEventPublisher {
    private static final String LAST_CLIENT_PING_AT = "imLastClientPingAt";
    private static final Duration CLIENT_HEARTBEAT_TIMEOUT = Duration.ofSeconds(90);
    private static final CloseStatus HEARTBEAT_TIMEOUT = new CloseStatus(4001, "heartbeat timeout");

    private final ObjectMapper objectMapper;
    private final TokenService tokenService;
    private final Map<Long, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> lastActiveByUser = new ConcurrentHashMap<>();
    private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();

    public void register(WebSocketSession session) {
        Long userId = userId(session);
        if (userId == null) return;
        Long tenantId = tenantId(session);
        LocalDateTime activeAt = LocalDateTime.now();
        session.getAttributes().put(LAST_CLIENT_PING_AT, System.currentTimeMillis());
        lastActiveByUser.put(userId, activeAt);
        AtomicBoolean becameOnline = new AtomicBoolean(false);
        sessionsByUser.compute(userId, (ignored, sessions) -> {
            Set<WebSocketSession> active = sessions == null ? new CopyOnWriteArraySet<>() : sessions;
            active.add(session);
            becameOnline.set(isSessionOnline(session) && onlineUsers.add(userId));
            return active;
        });
        if (becameOnline.get()) publishPresence(tenantId, userId, true, activeAt);
    }

    public void unregister(WebSocketSession session) {
        Long userId = userId(session);
        if (userId == null) return;
        Long tenantId = tenantId(session);
        LocalDateTime activeAt = LocalDateTime.now();
        AtomicBoolean becameOffline = new AtomicBoolean(false);
        sessionsByUser.computeIfPresent(userId, (ignored, sessions) -> {
            boolean contained = sessions.remove(session);
            becameOffline.set(contained && sessions.stream().noneMatch(this::isSessionOnline)
                    && onlineUsers.remove(userId));
            return sessions.isEmpty() ? null : sessions;
        });
        lastActiveByUser.put(userId, activeAt);
        if (becameOffline.get()) publishPresence(tenantId, userId, false, activeAt);
    }

    public void touch(WebSocketSession session) {
        Long userId = userId(session);
        if (userId == null) return;
        session.getAttributes().put(LAST_CLIENT_PING_AT, System.currentTimeMillis());
        lastActiveByUser.put(userId, LocalDateTime.now());
    }

    @Override
    public void publish(String eventType, Collection<Long> userIds, Object data) {
        if (userIds == null || userIds.isEmpty()) return;
        String payload = eventPayload(eventType, data);
        if (payload == null) return;
        userIds.stream().filter(Objects::nonNull).distinct().forEach(userId -> sendToUser(userId, payload));
    }

    public void send(WebSocketSession session, String type, Object data) {
        String payload = eventPayload(type, data);
        if (payload != null) send(session, payload);
    }

    @Override
    public boolean isOnline(Long userId) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        return sessions != null && sessions.stream().anyMatch(this::isSessionOnline);
    }

    @Override
    public LocalDateTime lastActiveAt(Long userId) {
        return lastActiveByUser.get(userId);
    }

    public boolean loginStillValid(WebSocketSession session) {
        Object token = session.getAttributes().get("imToken");
        return token instanceof String value && tokenService.getLoginUser(value) != null;
    }

    @Scheduled(fixedDelay = 30000)
    public void validateSessions() {
        sessionsByUser.values().stream().flatMap(Collection::stream).toList().forEach(session -> {
            if (!session.isOpen()) {
                unregister(session);
            } else if (!loginStillValid(session)) {
                try { session.close(CloseStatus.POLICY_VIOLATION); } catch (IOException ignored) { }
                unregister(session);
            } else if (!clientResponsive(session)) {
                try { session.close(HEARTBEAT_TIMEOUT); } catch (IOException ignored) { }
                unregister(session);
            } else {
                send(session, "connection.heartbeat", Map.of("at", Instant.now().toString()));
            }
        });
    }

    private void sendToUser(Long userId, String payload) {
        Set<WebSocketSession> sessions = sessionsByUser.getOrDefault(userId, Set.of());
        sessions.forEach(session -> sendIfLoginValid(session, payload));
    }

    private void sendIfLoginValid(WebSocketSession session, String payload) {
        boolean shouldUnregister = false;
        synchronized (session) {
            // 角色/数据范围/账号状态变化后，HTTP 登录态已失效；实时连接也必须在真正
            // 发送下一条业务消息前、拿到同一发送锁后复核版本，不能在慢发送队列前预检。
            if (!isSessionOnline(session)) {
                if (session.isOpen()) {
                    try { session.close(CloseStatus.POLICY_VIOLATION); } catch (Exception ignored) { }
                }
                shouldUnregister = true;
            } else {
                try {
                    session.sendMessage(new TextMessage(payload));
                } catch (Exception e) {
                    try { session.close(CloseStatus.SERVER_ERROR); } catch (Exception ignored) { }
                    shouldUnregister = true;
                }
            }
        }
        if (shouldUnregister) unregister(session);
    }

    private void send(WebSocketSession session, String payload) {
        boolean shouldUnregister = false;
        synchronized (session) {
            if (!session.isOpen()) {
                shouldUnregister = true;
            } else {
                try {
                session.sendMessage(new TextMessage(payload));
                } catch (Exception e) {
                    try { session.close(CloseStatus.SERVER_ERROR); } catch (Exception ignored) { }
                    shouldUnregister = true;
                }
            }
        }
        if (shouldUnregister) unregister(session);
    }

    private void publishPresence(Long tenantId, Long userId, boolean online, LocalDateTime activeAt) {
        if (tenantId == null) return;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", userId);
        data.put("online", online);
        data.put("lastActiveAt", activeAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        String payload = eventPayload("presence.changed", data);
        if (payload == null) return;
        sessionsByUser.values().stream()
                .flatMap(Collection::stream)
                .filter(session -> Objects.equals(tenantId, tenantId(session)))
                .toList()
                .forEach(session -> sendIfLoginValid(session, payload));
    }

    private String eventPayload(String type, Object data) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("type", type);
        event.put("serverTime", Instant.now().toString());
        event.put("data", data);
        try {
            return objectMapper.writeValueAsString(event);
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean isSessionOnline(WebSocketSession session) {
        return session.isOpen() && clientResponsive(session) && loginStillValid(session);
    }

    private boolean clientResponsive(WebSocketSession session) {
        Object value = session.getAttributes().get(LAST_CLIENT_PING_AT);
        if (!(value instanceof Number number)) return false;
        return System.currentTimeMillis() - number.longValue() <= CLIENT_HEARTBEAT_TIMEOUT.toMillis();
    }

    private Long userId(WebSocketSession session) {
        Object value = session.getAttributes().get("imUserId");
        return value instanceof Number number ? number.longValue() : null;
    }

    private Long tenantId(WebSocketSession session) {
        Object value = session.getAttributes().get("imTenantId");
        return value instanceof Number number ? number.longValue() : null;
    }
}
