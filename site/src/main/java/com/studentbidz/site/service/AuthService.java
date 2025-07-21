package com.studentbidz.site.service;

import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.UserRepository;
import com.studentbidz.site.dto.RegisterRequest;
import com.studentbidz.site.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent() ||
            userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Username or email already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Collections.singleton("USER"));
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        return user;
    }
} 