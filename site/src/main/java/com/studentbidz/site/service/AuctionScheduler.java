package com.studentbidz.site.service;

import com.studentbidz.site.entity.Notification;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.repository.ProductRepository;
import com.studentbidz.site.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AuctionScheduler {
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private BidRepository bidRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Check every minute for auctions ending soon or ended
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void checkAuctionStatus() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime thirtyOneMinFromNow = now.plusMinutes(31);
        OffsetDateTime twentyNineMinFromNow = now.plusMinutes(29);
        // Find auctions ending between 29 and 31 minutes from now (to catch the 30-min mark)
        List<Product> endingIn30Min = productRepository.findByStatusAndEndTimeBetween(
            Product.Status.ACTIVE, twentyNineMinFromNow, thirtyOneMinFromNow);
        for (Product product : endingIn30Min) {
            // Check if a 30-min notification has already been sent (by checking for a notification of this type for this product and user)
            bidRepository.findByProduct(product).forEach(bid -> {
                boolean alreadyNotified = notificationService.existsNotification(
                    bid.getBidder().getUsername(),
                    Notification.Type.AUCTION_ENDING,
                    product.getId(),
                    "30MIN"
                );
                if (!alreadyNotified) {
                    notificationService.createNotification(
                        bid.getBidder().getUsername(),
                        Notification.Type.AUCTION_ENDING,
                        "Auction ending soon!",
                        "The auction for \"" + product.getTitle() + "\" ends in 30 minutes. Current highest bid: ₹" +
                        bidRepository.findTopByProductOrderByAmountDesc(product)
                            .map(b -> b.getAmount())
                            .orElse(product.getStartingPrice()),
                        "/product/" + product.getId(),
                        product,
                        "30MIN"
                    );
                }
            });
        }
        
        // Find auctions that have ended but are still marked as active
        List<Product> endedAuctions = productRepository.findByStatusAndEndTimeBefore(
            Product.Status.ACTIVE, now);
        
        for (Product product : endedAuctions) {
            // Find the highest bid
            bidRepository.findTopByProductOrderByAmountDesc(product).ifPresentOrElse(
                highestBid -> {
                    // Set winner and mark as SOLD
                    product.setWinner(highestBid.getBidder());
                    product.setStatus(Product.Status.SOLD);
                    productRepository.save(product);

                    // Notify the winner
                    notificationService.createNotification(
                        highestBid.getBidder().getUsername(),
                        Notification.Type.DECLARED_WINNER,
                        "Congratulations! You won!",
                        "You've been declared the winner of \"" + product.getTitle() + "\" for ₹" + highestBid.getAmount(),
                        "/product/" + product.getId(),
                        product
                    );
                    
                    // Send WebSocket notification for winner declaration
                    messagingTemplate.convertAndSend(
                        "/topic/winner-declared/" + product.getId(),
                        product.getWinner().getUsername()
                    );
                },
                () -> {
                    // No bids, just mark as ENDED
                    product.setStatus(Product.Status.ENDED);
                    productRepository.save(product);
                }
            );
            
            // Notify all bidders that auction has ended
            bidRepository.findByProduct(product).forEach(bid -> {
                notificationService.createNotification(
                    bid.getBidder().getUsername(),
                    Notification.Type.AUCTION_ENDED,
                    "Auction ended",
                    "The auction for \"" + product.getTitle() + "\" has ended. Final price: ₹" + 
                    bidRepository.findTopByProductOrderByAmountDesc(product)
                        .map(b -> b.getAmount())
                        .orElse(product.getStartingPrice()),
                    "/product/" + product.getId(),
                    product
                );
            });
        }
    }
} 