package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc(); // Aktif bannerları sıralı getir
}