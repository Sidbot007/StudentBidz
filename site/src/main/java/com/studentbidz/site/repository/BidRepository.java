package com.studentbidz.site.repository;

import com.studentbidz.site.entity.Bid;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByProduct(Product product);
    List<Bid> findByProductOrderByAmountDesc(Product product);
    List<Bid> findByBidder(User bidder);
    Optional<Bid> findTopByProductOrderByAmountDesc(Product product);
    Optional<Bid> findByProductAndBidder(Product product, User bidder);
    List<Bid> findDistinctByProductAndBidderIsNotNull(Product product);
    void deleteByProduct(Product product);
    
    @Modifying
    @Query("DELETE FROM Bid b WHERE b.product = :product AND b.id != :excludeId")
    void deleteByProductAndIdNot(@Param("product") Product product, @Param("excludeId") Long excludeId);
    Optional<Bid> findTopByProductAndBidderOrderByTimestampDesc(Product product, User bidder);
    @Query("SELECT COUNT(b) FROM Bid b WHERE b.bidder = :bidder AND b.timestamp >= :since")
    long countByBidderSince(@Param("bidder") User bidder, @Param("since") OffsetDateTime since);
    @Query("SELECT COUNT(b) FROM Bid b WHERE b.bidder = :bidder AND b.timestamp >= :since AND b.product = :product")
    long countByBidderAndProductSince(@Param("bidder") User bidder, @Param("product") Product product, @Param("since") OffsetDateTime since);
} 