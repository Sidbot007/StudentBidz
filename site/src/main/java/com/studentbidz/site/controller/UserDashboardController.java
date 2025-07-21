package com.studentbidz.site.controller;

import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.service.UserDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class UserDashboardController {
    @Autowired
    private UserDashboardService dashboardService;

    @GetMapping("/selling/active")
    public ResponseEntity<List<Product>> getActiveSellingProducts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getSellingProducts(user.getUsername(), Product.Status.ACTIVE));
    }

    @GetMapping("/selling/sold")
    public ResponseEntity<List<Product>> getSoldProducts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getSellingProducts(user.getUsername(), Product.Status.SOLD));
    }

    @GetMapping("/bidding")
    public ResponseEntity<List<Product>> getBiddingProducts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getBiddingProducts(user.getUsername()));
    }

    @GetMapping("/won")
    public ResponseEntity<List<Product>> getWonAuctions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getWonAuctions(user.getUsername()));
    }
} 