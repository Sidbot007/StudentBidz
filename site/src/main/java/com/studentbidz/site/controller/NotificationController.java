package com.studentbidz.site.controller;

import com.studentbidz.site.dto.NotificationResponse;
import com.studentbidz.site.service.NotificationService;
import com.studentbidz.site.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@AuthenticationPrincipal User user) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(user.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user.getUsername());
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.deleteNotification(id, user.getUsername());
        return ResponseEntity.ok().build();
    }
} 