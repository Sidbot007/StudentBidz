package com.studentbidz.site.service;

import com.studentbidz.site.dto.ProductCreateRequest;
import com.studentbidz.site.dto.ProductResponse;
import com.studentbidz.site.dto.AuctionTimeUpdateRequest;
import com.studentbidz.site.dto.AuctionTimeUpdateMessage;
import com.studentbidz.site.dto.RelistProductRequest;
import com.studentbidz.site.dto.ProductRelistMessage;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.repository.ProductRepository;
import com.studentbidz.site.repository.UserRepository;
import com.studentbidz.site.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import com.studentbidz.site.entity.Bid;
import java.time.OffsetDateTime;


@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

    private String saveProductImage(MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String uploadsDir = "uploads/";
                Files.createDirectories(Paths.get(uploadsDir));
                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadsDir, filename);
                image.transferTo(filePath);
                return "/images/" + filename;
            } catch (IOException e) {
                throw new RuntimeException("Failed to save image", e);
            }
        }
        return null;
    }

    private void deleteProductImage(String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            String imagePath = imageUrl.replaceFirst("/images/", "uploads/");
            try {
                Files.deleteIfExists(Paths.get(imagePath));
            } catch (Exception e) {
                System.err.println("Failed to delete image file: " + imagePath);
            }
        }
    }

    public ProductResponse createProduct(ProductCreateRequest request, MultipartFile image, String username) {
        System.out.println("Principal username: " + username);
userRepository.findAll().forEach(u -> System.out.println("DB user: " + u.getUsername()));
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setStartingPrice(request.getStartingPrice());
        product.setEndTime(request.getEndTime());
        product.setSeller(seller);
        product.setType(Product.Type.valueOf(request.getType() != null ? request.getType() : "OTHERS"));
        String imageUrl = saveProductImage(image);
        if (imageUrl != null) {
            product.setImageUrl(imageUrl);
        }
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findByStatus(Product.Status.ACTIVE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getSellerProducts(String sellerUsername) {
        return productRepository.findAll().stream()
            .filter(p -> p.getSeller().getUsername().equals(sellerUsername) && 
                        (p.getStatus() == Product.Status.SOLD || p.getStatus() == Product.Status.ACTIVE || p.getStatus() == Product.Status.ENDED))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByType(String type) {
        List<Product> products;
        if (type == null || type.equalsIgnoreCase("ALL")) {
            products = productRepository.findByStatusOrderByEndTimeAsc(Product.Status.ACTIVE);
        } else {
            products = productRepository.findByTypeAndStatusOrderByEndTimeAsc(Product.Type.valueOf(type), Product.Status.ACTIVE);
        }
        return products.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductResponse updateAuctionTime(Long productId, AuctionTimeUpdateRequest request, String username) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user is the seller
        if (!product.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("Only the seller can update auction time");
        }
        
        // Check if auction is still active
        if (product.getStatus() != Product.Status.ACTIVE) {
            throw new RuntimeException("Cannot update time for ended auction");
        }
        
        // Validate new end time
        OffsetDateTime now = OffsetDateTime.now();
        if (request.getNewEndTime().isBefore(now)) {
            throw new RuntimeException("New end time must be in the future");
        }
        
        // Update the end time
        OffsetDateTime newEndTime = request.getNewEndTime();
        product.setEndTime(newEndTime);
        Product savedProduct = productRepository.save(product);
        
        // Send WebSocket notification
        AuctionTimeUpdateMessage message = new AuctionTimeUpdateMessage(
            productId, 
            newEndTime, 
            request.getReason(), 
            username
        );
        messagingTemplate.convertAndSend("/topic/auction-time-update/" + productId, message);
        
        // Create notifications for all bidders
        List<Bid> bids = bidRepository.findByProduct(product);
        for (Bid bid : bids) {
            notificationService.createNotification(
                bid.getBidder().getUsername(),
                Notification.Type.TIME_UPDATED,
                "Auction time updated",
                "The auction time for \"" + product.getTitle() + "\" has been updated by the seller",
                "/product/" + productId,
                product
            );
        }
        
        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse relistProduct(Long productId, RelistProductRequest request, String username) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user is the seller
        if (!product.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("Only the seller can relist the product");
        }
        
        // Check if product is sold
        if (product.getStatus() != Product.Status.SOLD) {
            throw new RuntimeException("Only sold products can be relisted");
        }
        
        // Validate new end time
        OffsetDateTime now = OffsetDateTime.now();
        if (request.getNewEndTime().isBefore(now)) {
            throw new RuntimeException("New end time must be in the future");
        }
        
        // Get all bids for this product, ordered by amount descending
        List<Bid> allBids = bidRepository.findByProductOrderByAmountDesc(product);
        
        // Find the second-highest bid amount and preserve it
        BigDecimal newStartingPrice = product.getStartingPrice(); // fallback to original starting price
        Bid secondHighestBid = null;
        
        if (allBids.size() >= 2) {
            // Get the second-highest bid
            secondHighestBid = allBids.get(1);
            newStartingPrice = secondHighestBid.getAmount();
        } else if (allBids.size() == 1) {
            // Only one bid, use the original starting price
            newStartingPrice = product.getStartingPrice();
        }
        
        // Delete all bids except the second-highest one (if it exists)
        if (secondHighestBid != null) {
            // Delete all bids except the second-highest
            bidRepository.deleteByProductAndIdNot(product, secondHighestBid.getId());
        } else {
            // Delete all bids if no second-highest bid exists
            bidRepository.deleteByProduct(product);
        }
        
        // Reset product status and winner, update starting price and end time
        product.setStatus(Product.Status.ACTIVE);
        product.setWinner(null);
        product.setStartingPrice(newStartingPrice);
        OffsetDateTime relistEndTime = request.getNewEndTime();
        product.setEndTime(relistEndTime);
        
        Product savedProduct = productRepository.save(product);
        
        // Send WebSocket notification
        ProductRelistMessage message = new ProductRelistMessage(
            productId, 
            relistEndTime, 
            username
        );
        messagingTemplate.convertAndSend("/topic/product-relist/" + productId, message);
        
        // Create notification for the preserved bidder (if any)
        if (secondHighestBid != null) {
            notificationService.createNotification(
                secondHighestBid.getBidder().getUsername(),
                Notification.Type.PRODUCT_RELISTED,
                "Product relisted",
                "The product \"" + product.getTitle() + "\" has been relisted and your bid is still active",
                "/product/" + productId,
                product
            );
        }
        
        return toResponse(savedProduct);
    }

    @Transactional
    public void restrictBidder(Long productId, Long userId, String sellerUsername) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getSeller().getUsername().equals(sellerUsername)) {
            throw new RuntimeException("Only the seller can restrict bidders for this product");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        product.getRestrictedBidders().add(user);
        productRepository.save(product);
    }

    @Transactional
    public void unrestrictBidder(Long productId, Long userId, String sellerUsername) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getSeller().getUsername().equals(sellerUsername)) {
            throw new RuntimeException("Only the seller can unrestrict bidders for this product");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        product.getRestrictedBidders().remove(user);
        productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, String username) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        System.out.println("Delete requested by: " + username);
        System.out.println("Product seller: " + product.getSeller().getUsername());
        if (!product.getSeller().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }
        // Delete all bids for this product
        bidRepository.findByProduct(product).forEach(bidRepository::delete);
        // Remove product from restricted bidders
        product.getRestrictedBidders().clear();
        // Delete image file if exists
        deleteProductImage(product.getImageUrl());
        productRepository.delete(product);
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse resp = new ProductResponse();
        resp.setId(product.getId());
        resp.setTitle(product.getTitle());
        resp.setDescription(product.getDescription());
        resp.setImageUrl(product.getImageUrl());
        resp.setStartingPrice(product.getStartingPrice());
        resp.setEndTime(product.getEndTime());
        resp.setSellerUsername(product.getSeller().getUsername());
        resp.setType(product.getType().name());
        
        // Set currentBid (highest bid)
        BigDecimal currentBid = bidRepository.findTopByProductOrderByAmountDesc(product)
            .map(bid -> bid.getAmount())
            .orElse(product.getStartingPrice());
        resp.setCurrentBid(currentBid);
        
        // Set second-highest bid for sold products (for relisting purposes)
        if (product.getStatus() == Product.Status.SOLD) {
            List<Bid> allBids = bidRepository.findByProductOrderByAmountDesc(product);
            if (allBids.size() >= 2) {
                resp.setSecondHighestBid(allBids.get(1).getAmount());
            } else {
                resp.setSecondHighestBid(product.getStartingPrice());
            }
        }
        
        resp.setStatus(product.getStatus().name());
        if (product.getWinner() != null) {
            resp.setWinnerUsername(product.getWinner().getUsername());
        }
        // Set restrictedBidders as list of user IDs
        resp.setRestrictedBidders(product.getRestrictedBidders().stream().map(u -> u.getId()).collect(java.util.stream.Collectors.toList()));
        return resp;
    }
} 