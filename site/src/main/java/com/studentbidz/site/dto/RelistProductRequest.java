package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RelistProductRequest {
    private java.time.OffsetDateTime newEndTime;

    // Default constructor
    public RelistProductRequest() {}

    public RelistProductRequest(java.time.OffsetDateTime newEndTime) {
        this.newEndTime = newEndTime;
    }
} 