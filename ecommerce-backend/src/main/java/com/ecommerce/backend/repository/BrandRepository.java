package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    Optional<Brand> findByName(String name);
    Optional<Brand> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}