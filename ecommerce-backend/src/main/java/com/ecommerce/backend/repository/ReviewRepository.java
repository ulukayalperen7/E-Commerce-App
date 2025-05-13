package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Page<Review> findByProduct(Product product, Pageable pageable);
    Page<Review> findByProduct_ProductId(Integer productId, Pageable pageable);
    List<Review> findByUser(User user);
    boolean existsByProductAndUser(Product product, User user); // Bir kullanıcının bir ürüne daha önce yorum yapıp yapmadığını kontrol etmek için
}