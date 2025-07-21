package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;




@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String status;
    private java.time.OffsetDateTime createdAt;
    private String relatedUrl;
    private Long productId;
    private String productTitle;
} 