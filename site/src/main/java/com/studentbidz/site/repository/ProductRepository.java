package com.studentbidz.site.repository;

import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.OffsetDateTime;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySeller(User seller);
    List<Product> findBySellerAndStatus(User seller, Product.Status status);
    List<Product> findByWinner(User winner);
    List<Product> findByStatus(Product.Status status);
    List<Product> findByStatusAndEndTimeBetween(Product.Status status, OffsetDateTime start, OffsetDateTime end);
    List<Product> findByStatusAndEndTimeBefore(Product.Status status, OffsetDateTime time);
    List<Product> findByTypeAndStatusOrderByEndTimeAsc(Product.Type type, Product.Status status);
    List<Product> findByStatusOrderByEndTimeAsc(Product.Status status);
    
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<Product> findActiveProducts();
} 