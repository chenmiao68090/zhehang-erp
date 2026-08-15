package com.zhehang.erp.modules.im.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.Arrays;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class ImWebSocketConfig implements WebSocketConfigurer {
    private final ImWebSocketHandler handler;
    private final ImHandshakeInterceptor handshakeInterceptor;

    @Value("${security.cors.allowed-origins:https://zhehangjituan.xn--fiqs8s}")
    private String allowedOrigins;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/im")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(value -> !value.isEmpty())
                        .toArray(String[]::new));
    }
}
