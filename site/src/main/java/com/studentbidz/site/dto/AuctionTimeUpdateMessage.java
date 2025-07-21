package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuctionTimeUpdateMessage {
    private Long productId;
    private java.time.OffsetDateTime newEndTime;
    private String reason;
    private String sellerUsername;

    // Default constructor
    public AuctionTimeUpdateMessage() {}

    public AuctionTimeUpdateMessage(Long productId, java.time.OffsetDateTime newEndTime, String reason, String sellerUsername) {
        this.productId = productId;
        this.newEndTime = newEndTime;
        this.reason = reason;
        this.sellerUsername = sellerUsername;
    }
} 