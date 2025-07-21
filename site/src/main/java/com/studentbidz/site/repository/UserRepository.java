package com.studentbidz.site.repository;

import com.studentbidz.site.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
} 