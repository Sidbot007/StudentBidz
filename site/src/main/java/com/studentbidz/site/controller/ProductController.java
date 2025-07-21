package com.studentbidz.site.controller;

import com.studentbidz.site.dto.ProductCreateRequest;
import com.studentbidz.site.dto.ProductResponse;
import com.studentbidz.site.dto.AuctionTimeUpdateRequest;
import com.studentbidz.site.dto.RelistProductRequest;
import com.studentbidz.site.service.ProductService;
import com.studentbidz.site.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import com.studentbidz.site.entity.Product;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestPart("product") ProductCreateRequest request,
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal User user) {
        ProductResponse response = productService.createProduct(request, image, user.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<ProductResponse>> getSellerProducts(@AuthenticationPrincipal User user) {
        List<ProductResponse> sellerProducts = productService.getSellerProducts(user.getUsername());
        return ResponseEntity.ok(sellerProducts);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ProductResponse>> getProductsByType(@PathVariable String type) {
        return ResponseEntity.ok(productService.getProductsByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(productService.toResponse(product));
    }

    @PatchMapping("/{id}/update-time")
    public ResponseEntity<ProductResponse> updateAuctionTime(
            @PathVariable Long id,
            @RequestBody AuctionTimeUpdateRequest request,
            @AuthenticationPrincipal User user) {
        ProductResponse response = productService.updateAuctionTime(id, request, user.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/relist")
    public ResponseEntity<ProductResponse> relistProduct(
            @PathVariable Long id,
            @RequestBody RelistProductRequest request,
            @AuthenticationPrincipal User user) {
        ProductResponse response = productService.relistProduct(id, request, user.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{productId}/restrict-bidder/{userId}")
    public ResponseEntity<Void> restrictBidder(@PathVariable Long productId, @PathVariable Long userId, @AuthenticationPrincipal com.studentbidz.site.entity.User seller) {
        productService.restrictBidder(productId, userId, seller.getUsername());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{productId}/unrestrict-bidder/{userId}")
    public ResponseEntity<Void> unrestrictBidder(@PathVariable Long productId, @PathVariable Long userId, @AuthenticationPrincipal com.studentbidz.site.entity.User seller) {
        productService.unrestrictBidder(productId, userId, seller.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal User user) {
        productService.deleteProduct(id, user.getUsername());
        return ResponseEntity.ok().build();
    }
} 