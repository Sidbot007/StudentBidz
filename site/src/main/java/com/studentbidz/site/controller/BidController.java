package com.studentbidz.site.controller;

import com.studentbidz.site.dto.BidRequest;
import com.studentbidz.site.dto.BidResponse;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping
public class BidController {
    @Autowired
    private BidService bidService;

    // Place or re-bid on a product
    @PostMapping("/products/{productId}/bids")
    public ResponseEntity<BidResponse> placeBid(@PathVariable Long productId,
                                                @RequestBody BidRequest request,
                                                @AuthenticationPrincipal User user) {
        BidResponse response = bidService.placeBid(productId, request, user.getUsername());
        return ResponseEntity.ok(response);
    }

    // Get all bids for a product
    @GetMapping("/products/{productId}/bids")
    public ResponseEntity<List<BidResponse>> getBidsForProduct(@PathVariable Long productId) {
        List<BidResponse> bids = bidService.getBidsForProduct(productId);
        return ResponseEntity.ok(bids);
    }

    // Get highest bid for a product (seller only)
    @GetMapping("/products/{productId}/highest-bid")
    public ResponseEntity<BidResponse> getHighestBid(@PathVariable Long productId, @AuthenticationPrincipal User user) {
        BidResponse highest = bidService.getHighestBidForProduct(productId, user.getUsername());
        return ResponseEntity.ok(highest);
    }

    // Get all bids by the authenticated user
    @GetMapping("/users/me/bids")
    public ResponseEntity<List<BidResponse>> getBidsByUser(@AuthenticationPrincipal User user) {
        List<BidResponse> bids = bidService.getBidsByUser(user.getUsername());
        return ResponseEntity.ok(bids);
    }

    // Seller: Get all unique bidders for their product
    @GetMapping("/products/{productId}/bidders")
    public ResponseEntity<List<BidResponse>> getBiddersForProduct(@PathVariable Long productId,
                                                            @AuthenticationPrincipal User user) {
        List<BidResponse> bidders = bidService.getBiddersWithAmountsForProduct(productId, user.getUsername());
        return ResponseEntity.ok(bidders);
    }

    // Seller declares a winner and marks product as sold
    @PatchMapping("/products/{productId}/declare-winner/{bidderId}")
    public ResponseEntity<?> declareWinner(@PathVariable Long productId, @PathVariable Long bidderId, @AuthenticationPrincipal User seller) {
        bidService.declareWinner(productId, bidderId, seller.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bids/{id}")
    public ResponseEntity<Void> deleteBid(@PathVariable Long id, @AuthenticationPrincipal User user) {
        bidService.deleteBid(id, user.getUsername());
        return ResponseEntity.ok().build();
    }
} 