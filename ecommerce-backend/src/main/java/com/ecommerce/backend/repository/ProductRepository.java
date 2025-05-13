package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Brand;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// import java.util.List; // Eğer List dönen metotlar da varsa

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Page<Product> findByCategory(Category category, Pageable pageable);
    Page<Product> findByBrand(Brand brand, Pageable pageable);
    Page<Product> findByCategoryAndIsActiveTrue(Category category, Pageable pageable);
    Page<Product> findByBrandAndIsActiveTrue(Brand brand, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findBySellerAndIsActiveTrue(User seller, Pageable pageable);
    Page<Product> findBySeller_UserIdAndIsActiveTrue(Integer sellerId, Pageable pageable);

    // <<< DÜZELTME BURADA >>>
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.categoryId = :categoryId) AND " +
           "(:brandId IS NULL OR p.brand.brandId = :brandId) AND " +
           "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " + // p.description üzerindeki LOWER kaldırıldı
           "p.isActive = true")
    Page<Product> searchActiveProducts(
            @Param("categoryId") Integer categoryId,
            @Param("brandId") Integer brandId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}