package com.studentbidz.site.controller;

import com.studentbidz.site.dto.MessageResponse;
import com.studentbidz.site.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{productId}")
    public void sendChatMessage(@DestinationVariable Long productId, ChatMessagePayload payload) {
        // Save message and broadcast to topic
        MessageResponse saved = messageService.saveMessage(productId, payload.getSenderUsername(), payload.getContent());
        messagingTemplate.convertAndSend("/topic/chat/" + productId, saved);
    }

    public static class ChatMessagePayload {
        private String senderUsername;
        private String content;
        // getters/setters
        public String getSenderUsername() { return senderUsername; }
        public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
} 