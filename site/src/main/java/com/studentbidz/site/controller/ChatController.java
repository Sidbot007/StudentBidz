package com.studentbidz.site.controller;

import com.studentbidz.site.dto.MessageResponse;
import com.studentbidz.site.service.MessageService;
import com.studentbidz.site.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/products/{productId}/messages")
public class ChatController {
    @Autowired
    private MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getChatHistory(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.getChatHistory(productId, user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user,
            @RequestBody String content) {
        return ResponseEntity.ok(messageService.saveMessage(productId, user.getUsername(), content));
    }
} 