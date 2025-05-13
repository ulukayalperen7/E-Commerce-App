package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Page<Order> findByUserOrderByOrderDateDesc(User user, Pageable pageable);
    Page<Order> findByUser_UserIdOrderByOrderDateDesc(Integer userId, Pageable pageable);    // Admin için tüm siparişleri sayfalama
    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);
    Optional<Order> findByOrderIdAndUser(Integer orderId, User user);
}