package com.studentbidz.site.service;

import com.studentbidz.site.dto.MessageResponse;
import com.studentbidz.site.entity.Message;
import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.MessageRepository;
import com.studentbidz.site.repository.ProductRepository;
import com.studentbidz.site.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    public List<MessageResponse> getChatHistory(Long productId, String username) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        // Only allow seller or winner
        if (!product.getSeller().getUsername().equals(username) &&
            (product.getWinner() == null || !product.getWinner().getUsername().equals(username))) {
            throw new RuntimeException("Not authorized to view chat");
        }
        return messageRepository.findByProductOrderByCreatedAtAsc(product)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse saveMessage(Long productId, String senderUsername, String content) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        User sender = userRepository.findByUsername(senderUsername)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        // Only allow seller or winner
        if (!product.getSeller().getUsername().equals(senderUsername) &&
            (product.getWinner() == null || !product.getWinner().getUsername().equals(senderUsername))) {
            throw new RuntimeException("Not authorized to send message");
        }
        User receiver = product.getSeller().getUsername().equals(senderUsername)
            ? product.getWinner() : product.getSeller();
        // Force eager initialization
        sender.getUsername();
        receiver.getUsername();
        Message message = new Message();
        message.setProduct(product);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setCreatedAt(java.time.OffsetDateTime.now());
        messageRepository.save(message);
        
        // Create notification for receiver
        notificationService.createNotification(
            receiver.getUsername(),
            Notification.Type.CHAT_MESSAGE,
            "New message from " + sender.getUsername(),
            "You have a new message about \"" + product.getTitle() + "\": " + content.substring(0, Math.min(content.length(), 50)) + (content.length() > 50 ? "..." : ""),
            "/chat/" + productId,
            product
        );
        
        return toResponse(message);
    }

    private MessageResponse toResponse(Message message) {
        MessageResponse resp = new MessageResponse();
        resp.setId(message.getId());
        resp.setContent(message.getContent());
        resp.setSenderUsername(message.getSender().getUsername());
        resp.setReceiverUsername(message.getReceiver().getUsername());
        resp.setCreatedAt(message.getCreatedAt());
        return resp;
    }
} 