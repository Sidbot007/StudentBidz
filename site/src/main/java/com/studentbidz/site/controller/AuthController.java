package com.studentbidz.site.controller;

import com.studentbidz.site.service.AuthService;
import com.studentbidz.site.security.JwtUtil;
import com.studentbidz.site.dto.RegisterRequest;
import com.studentbidz.site.dto.LoginRequest;
import com.studentbidz.site.dto.AuthResponse;
import com.studentbidz.site.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.authenticate(request);
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        // Return only safe user info
        return ResponseEntity.ok(new UserProfile(user.getId(), user.getUsername(), user.getEmail(), user.getRoles()));
    }

    // Helper DTO for safe user info
    public static class UserProfile {
        private Long id;
        private String username;
        private String email;
        private Object roles;
        public UserProfile(Long id, String username, String email, Object roles) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.roles = roles;
        }
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public Object getRoles() { return roles; }
    }
} 