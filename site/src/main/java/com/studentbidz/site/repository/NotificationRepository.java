package com.studentbidz.site.repository;

import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndStatusOrderByCreatedAtDesc(User user, Notification.Status status);
    long countByUserAndStatus(User user, Notification.Status status);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.user = :user")
    void markAllAsRead(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);

    boolean existsByUserUsernameAndTypeAndProductIdAndTag(String username, Notification.Type type, Long productId, String tag);
} 