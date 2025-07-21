package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRelistMessage {
    private Long productId;
    private java.time.OffsetDateTime newEndTime;
    private String sellerUsername;

    // Default constructor
    public ProductRelistMessage() {}

    public ProductRelistMessage(Long productId, java.time.OffsetDateTime newEndTime, String sellerUsername) {
        this.productId = productId;
        this.newEndTime = newEndTime;
        this.sellerUsername = sellerUsername;
    }
} 