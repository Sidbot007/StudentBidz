package com.studentbidz.site.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;

    public AuthResponse(String token) {
        this.token = token;
    }
} 