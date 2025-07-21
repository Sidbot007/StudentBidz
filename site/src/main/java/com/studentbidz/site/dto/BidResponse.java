package com.studentbidz.site.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BidResponse {
    private Long id;
    private BigDecimal amount;
    private OffsetDateTime timestamp;
    private String bidderUsername;
    private Long bidderId;
    private ProductResponse product;
} 