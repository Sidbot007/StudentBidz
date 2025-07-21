package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuctionTimeUpdateRequest {
    private java.time.OffsetDateTime newEndTime;
    private String reason;

    // Default constructor
    public AuctionTimeUpdateRequest() {}

    public AuctionTimeUpdateRequest(java.time.OffsetDateTime newEndTime, String reason) {
        this.newEndTime = newEndTime;
        this.reason = reason;
    }
} 