package com.studentbidz.site.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import java.util.Map;
import com.studentbidz.site.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .addInterceptors(new JwtHandshakeInterceptor(jwtUtil))
            .setAllowedOriginPatterns("*").withSockJS();
        registry.addEndpoint("/ws")
            .addInterceptors(new JwtHandshakeInterceptor(jwtUtil))
            .setAllowedOriginPatterns("*"); // For pure WebSocket
    }

    // Inner class for JWT handshake interceptor
    public static class JwtHandshakeInterceptor implements HandshakeInterceptor {
        private final JwtUtil jwtUtil;
        public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
            this.jwtUtil = jwtUtil;
        }
        @Override
        public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                       @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
            String query = request.getURI().getQuery();
            if (query != null && query.contains("token=")) {
                String token = null;
                for (String param : query.split("&")) {
                    if (param.startsWith("token=")) {
                        token = param.substring(6);
                        break;
                    }
                }
                if (token != null) {
                    try {
                        String username = jwtUtil.extractUsername(token);
                        if (username != null && jwtUtil.validateToken(token, username)) {
                            attributes.put("user", username);
                            return true;
                        }
                    } catch (Exception e) {
                        // Invalid token
                        return false;
                    }
                }
            }
            return false; // Reject connection if no valid token
        }
        @Override
        public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull  ServerHttpResponse response,
                                  @NonNull WebSocketHandler wsHandler, @Nullable Exception exception) {}
    }
} 