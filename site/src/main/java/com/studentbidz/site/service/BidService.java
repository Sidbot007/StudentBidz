package com.studentbidz.site.service;

import com.studentbidz.site.dto.BidRequest;
import com.studentbidz.site.dto.BidResponse;
import com.studentbidz.site.dto.BidUpdateMessage;
import com.studentbidz.site.entity.Bid;
import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import com.studentbidz.site.repository.BidRepository;
import com.studentbidz.site.repository.ProductRepository;
import com.studentbidz.site.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BidService {
    @Autowired
    private BidRepository bidRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ProductService productService;
    @Autowired
    private NotificationService notificationService;

    public BidResponse placeBid(Long productId, BidRequest request, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        User bidder = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (product.getEndTime().isBefore(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auction has ended");
        }
        
        // Get current highest bid
        BigDecimal highest = bidRepository.findTopByProductOrderByAmountDesc(product)
                .map(Bid::getAmount)
                .orElse(product.getStartingPrice());
        
        // 1. Bid Frequency Limiting: No more than 1 bid per 1 minute per product
        Bid lastUserBid = bidRepository.findTopByProductAndBidderOrderByTimestampDesc(product, bidder).orElse(null);
        if (lastUserBid != null && lastUserBid.getTimestamp().isAfter(OffsetDateTime.now().minusMinutes(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only bid once every 1 minute on this product.");
        }

        // Restrict functionality: Check if user is restricted from bidding on this product
        if (product.getRestrictedBidders() != null && product.getRestrictedBidders().stream().anyMatch(u -> u.getId().equals(bidder.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are restricted from bidding on this product by the seller.");
        }

        // 2. Maximum Bid Increment: No more than 2x the current highest bid
        BigDecimal maxAllowed = highest.multiply(BigDecimal.valueOf(2));
        if (request.getAmount().compareTo(maxAllowed) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bid cannot be more than 2x the current highest bid.");
        }

        // 3. Minimum Bid Increment: At least ₹1 more than current highest bid
        if (request.getAmount().subtract(highest).compareTo(BigDecimal.valueOf(1)) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bid must be at least ₹1 higher than the current highest bid.");
        }

        // 4. Daily/Session Bid Limits: Max 50 bids per day, 20 per product per day
        OffsetDateTime since = OffsetDateTime.now().minusDays(1);
        long dailyCount = bidRepository.countByBidderSince(bidder, since);
        long productDailyCount = bidRepository.countByBidderAndProductSince(bidder, product, since);
        if (dailyCount >= 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have reached your daily bid limit (50).");
        }
        if (productDailyCount >= 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have reached your daily bid limit (20) for this product.");
        }
        
        if (request.getAmount().compareTo(highest) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bid must be higher than current highest bid");
        }
        
        // Get the previous highest bidder to notify them
        String previousHighestBidder = null;
        if (highest.compareTo(product.getStartingPrice()) > 0) {
            previousHighestBidder = bidRepository.findTopByProductOrderByAmountDesc(product)
                .map(bid -> bid.getBidder().getUsername())
                .orElse(null);
        }
        
        // Remove previous bid by this user for this product (re-bid logic)
        bidRepository.findByProductAndBidder(product, bidder).ifPresent(bidRepository::delete);
        
        // Save new bid
        Bid bid = new Bid();
        bid.setAmount(request.getAmount());
        bid.setTimestamp(OffsetDateTime.now());
        bid.setProduct(product);
        bid.setBidder(bidder);
        Bid saved = bidRepository.save(bid);

        // Auction auto-extend: if bid placed in last minute, extend by 2 minutes
        OffsetDateTime now = OffsetDateTime.now();
        if (product.getEndTime().isAfter(now) && product.getEndTime().isBefore(now.plusMinutes(1))) {
            product.setEndTime(product.getEndTime().plusMinutes(2));
            productRepository.save(product);
            // Broadcast new end time
            messagingTemplate.convertAndSend(
                "/topic/auction-time-update/" + productId,
                new com.studentbidz.site.dto.AuctionTimeUpdateMessage(productId, product.getEndTime(), null, product.getSeller().getUsername())
            );
        }
        
        // Create outbid notification for previous highest bidder
        if (previousHighestBidder != null && !previousHighestBidder.equals(username)) {
            notificationService.createNotification(
                previousHighestBidder,
                Notification.Type.OUTBID,
                "You've been outbid!",
                username + " has outbid you on \"" + product.getTitle() + "\" with ₹" + request.getAmount(),
                "/product/" + productId,
                product
            );
        }
        
        // Broadcast bid update
        BidUpdateMessage update = new BidUpdateMessage(productId, saved.getAmount(), bidder.getUsername(), saved.getTimestamp());
        messagingTemplate.convertAndSend("/topic/bids/" + productId, update);
        return toResponse(saved);
    }

    public BidResponse getHighestBidForProduct(Long productId, String username) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.getSeller().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the seller can view the highest bid");
        }
        return bidRepository.findTopByProductOrderByAmountDesc(product)
                .map(this::toResponse)
                .orElse(null);
    }

    public List<BidResponse> getBidsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return bidRepository.findByBidder(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BidResponse> getBiddersWithAmountsForProduct(Long productId, String sellerUsername) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.getSeller().getUsername().equals(sellerUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the seller can view bidders");
        }
        return bidRepository.findByProduct(product).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BidResponse> getBidsForProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return bidRepository.findByProduct(product).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public void declareWinner(Long productId, Long bidderId, String sellerUsername) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getSeller().getUsername().equals(sellerUsername)) {
            throw new RuntimeException("Only the seller can declare a winner");
        }
        if (product.getStatus() != Product.Status.ACTIVE) {
            throw new RuntimeException("Product is not active");
        }
        User winner = userRepository.findById(bidderId)
            .orElseThrow(() -> new RuntimeException("Bidder not found"));
        product.setWinner(winner);
        product.setStatus(Product.Status.SOLD);
        productRepository.save(product);
        
        // Create winner notification
        notificationService.createNotification(
            winner.getUsername(),
            Notification.Type.DECLARED_WINNER,
            "Congratulations! You won!",
            "You've been declared the winner of \"" + product.getTitle() + "\" for ₹" + bidRepository.findTopByProductOrderByAmountDesc(product).map(Bid::getAmount).orElse(product.getStartingPrice()),
            "/product/" + productId,
            product
        );
    }

    public void deleteBid(Long bidId, String username) {
        Bid bid = bidRepository.findById(bidId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bid not found"));
        if (!bid.getBidder().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this bid");
        }
        Product product = bid.getProduct();
        boolean wasWinner = product.getWinner() != null && product.getWinner().getId().equals(bid.getBidder().getId());
        bidRepository.delete(bid);
        if (wasWinner) {
            product.setWinner(null);
            product.setStatus(Product.Status.ENDED);
            productRepository.save(product);
            // Notify the seller
            notificationService.createNotification(
                product.getSeller().getUsername(),
                Notification.Type.WINNER_EXITED,
                "Winner exited auction",
                "The winner has exited the auction for '" + product.getTitle() + "'. You may relist or contact other bidders.",
                "/product/" + product.getId(),
                product
            );
        }
    }

    private BidResponse toResponse(Bid bid) {
        BidResponse resp = new BidResponse();
        resp.setId(bid.getId());
        resp.setAmount(bid.getAmount());
        resp.setTimestamp(bid.getTimestamp());
        resp.setBidderUsername(bid.getBidder().getUsername());
        resp.setBidderId(bid.getBidder().getId());
        resp.setProduct(productService.toResponse(bid.getProduct()));
        return resp;
    }
}

