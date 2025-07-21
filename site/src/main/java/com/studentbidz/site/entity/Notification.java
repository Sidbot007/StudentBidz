package com.studentbidz.site.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {
    public enum Type { 
        CHAT_MESSAGE, 
        DECLARED_WINNER, 
        OUTBID, 
        AUCTION_ENDING, 
        AUCTION_ENDED,
        PRODUCT_RELISTED,
        TIME_UPDATED,
        WINNER_EXITED // New type for winner exit notifications
    }
    
    public enum Status { READ, UNREAD }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.UNREAD;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column
    private String relatedUrl; // URL to navigate to when clicked

    @Column
    private String tag; // Optional marker for deduplication (e.g., '30MIN')

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
} 