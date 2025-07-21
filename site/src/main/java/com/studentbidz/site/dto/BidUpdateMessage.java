package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
public class BidUpdateMessage {
    private Long productId;
    private BigDecimal bidAmount;
    private String bidderUsername;
    private OffsetDateTime timestamp;

    public BidUpdateMessage() {}

    public BidUpdateMessage(Long productId, BigDecimal bidAmount, String bidderUsername, OffsetDateTime timestamp) {
        this.productId = productId;
        this.bidAmount = bidAmount;
        this.bidderUsername = bidderUsername;
        this.timestamp = timestamp;
    }
} 