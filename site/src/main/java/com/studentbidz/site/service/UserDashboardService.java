package com.studentbidz.site.service;


import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.BidRepository;
import com.studentbidz.site.repository.ProductRepository;
import com.studentbidz.site.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserDashboardService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private BidRepository bidRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Product> getSellingProducts(String username, Product.Status status) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        return productRepository.findBySellerAndStatus(user, status);
    }

    @Transactional(readOnly = true)
    public List<Product> getBiddingProducts(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        Set<Long> productIds = bidRepository.findByBidder(user).stream()
                .map(bid -> bid.getProduct().getId())
                .collect(Collectors.toSet());
        return productRepository.findAllById(productIds);
    }

    @Transactional(readOnly = true)
    public List<Product> getWonAuctions(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return List.of();
        return productRepository.findByWinner(user);
    }
} 