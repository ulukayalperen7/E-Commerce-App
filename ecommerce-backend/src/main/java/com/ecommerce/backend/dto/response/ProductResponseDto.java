package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponseDto {
    private Integer productId;
    private String name;
    private String description;
    private BigDecimal price;
    private CategoryResponseDto category; // Kategori bilgilerini de döndürelim
    private BrandResponseDto brand;     // Marka bilgilerini de döndürelim
    private Integer stockQuantity;
    private String imageUrl; // Ana resim
    private List<ProductImageResponseDto> additionalImages; // Ek resimler
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double averageRating; // Ortalama puan (servis katmanında hesaplanabilir)
    private Integer totalReviews; // Toplam yorum sayısı (servis katmanında hesaplanabilir)
    private UserSummaryResponseDto seller;
}