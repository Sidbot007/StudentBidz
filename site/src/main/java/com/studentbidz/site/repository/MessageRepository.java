package com.studentbidz.site.repository;

import com.studentbidz.site.entity.Message;
import com.studentbidz.site.entity.Product;
import com.studentbidz.site.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProductOrderByCreatedAtAsc(Product product);
    List<Message> findByProductAndSenderOrProductAndReceiverOrderByCreatedAtAsc(Product product, User sender, Product product2, User receiver);
} 