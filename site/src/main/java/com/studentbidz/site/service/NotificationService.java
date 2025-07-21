package com.studentbidz.site.service;

import com.studentbidz.site.dto.NotificationResponse;
import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.NotificationRepository;
import com.studentbidz.site.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createNotification(String username, Notification.Type type, String title, 
                                 String message, String relatedUrl, Product product, String tag) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedUrl(relatedUrl);
        notification.setProduct(product);
        notification.setTag(tag);

        Notification savedNotification = notificationRepository.save(notification);

        // Send WebSocket notification
        messagingTemplate.convertAndSendToUser(
            username,
            "/topic/notifications",
            toResponse(savedNotification)
        );
    }

    @Transactional
    public void createNotification(String username, Notification.Type type, String title, 
                                 String message, String relatedUrl, Product product) {
        createNotification(username, type, title, message, relatedUrl, product, null);
    }

    public boolean existsNotification(String username, Notification.Type type, Long productId, String tag) {
        return notificationRepository.existsByUserUsernameAndTypeAndProductIdAndTag(username, type, productId, tag);
    }

    public List<NotificationResponse> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserAndStatusOrderByCreatedAtDesc(user, Notification.Status.UNREAD)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.countByUserAndStatus(user, Notification.Status.UNREAD);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllAsRead(user);
    }

    @Transactional
    public void deleteNotification(Long notificationId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this notification");
        }
        notificationRepository.delete(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getType().name(),
            notification.getStatus().name(),
            notification.getCreatedAt(),
            notification.getRelatedUrl(),
            notification.getProduct() != null ? notification.getProduct().getId() : null,
            notification.getProduct() != null ? notification.getProduct().getTitle() : null
        );
    }
} 