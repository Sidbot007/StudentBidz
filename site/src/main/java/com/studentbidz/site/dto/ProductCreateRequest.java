package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCreateRequest {
    private String title;
    private String description;
    private java.math.BigDecimal startingPrice;
    private java.time.OffsetDateTime endTime;
    private String type;
} 