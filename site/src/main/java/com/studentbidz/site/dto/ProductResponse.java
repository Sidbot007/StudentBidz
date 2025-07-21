package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private BigDecimal startingPrice;
    private OffsetDateTime endTime;
    private String sellerUsername;
    private BigDecimal currentBid;
    private BigDecimal secondHighestBid;
    private String status;
    private String winnerUsername;
    private List<Long> restrictedBidders;
    private String type;
} 