package com.studentbidz.site.security;

import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip JWT processing for login and register endpoints
        String path = request.getServletPath();
        if (path.equals("/login") || path.equals("/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader;
        if (request.getServletPath().equals("/ws")) {
            // For WebSocket handshake, get token from query parameter if header is missing
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isEmpty()) {
                authHeader = "Bearer " + tokenParam;
            } else {
                authHeader = request.getHeader("Authorization");
            }
        } else {
            authHeader = request.getHeader("Authorization");
        }

        String username = null;
        String jwt = null;

        System.out.println("Request path: " + path);
        System.out.println("Authorization header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("Extracted username: " + username);
            } catch (Exception e) {
                // Invalid token
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByUsername(username).orElse(null);
            System.out.println("Found user: " + (user != null ? user.getUsername() : "null"));
            if (user != null && jwtUtil.validateToken(jwt, user.getUsername())) {
                System.out.println("Token validated successfully");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user, null,
                        user.getRoles().stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Authentication set in SecurityContext");
            } else {
                System.out.println("Token validation failed or user not found");
            }
        } else {
            System.out.println("Username is null or authentication already exists");
        }
        filterChain.doFilter(request, response);
    }
} 