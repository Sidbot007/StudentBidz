package com.studentbidz.site.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product {
    public enum Status { ACTIVE, ENDED, SOLD }
    public enum Type { BOOKS, ELECTRONICS, CLOTHING, STATIONARY, ACCESSORIES, OTHERS }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal startingPrice;

    @Column(nullable = false)
    private OffsetDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type = Type.OTHERS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_restricted_bidders",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private java.util.Set<User> restrictedBidders = new java.util.HashSet<>();

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
} 