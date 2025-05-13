package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductSummaryResponseDto {
    private Integer productId;
    private String name;
    private BigDecimal price;
    private String imageUrl; // Ana resim
    private String categoryName; // Sadece kategori adı
    private String brandName;    // Sadece marka adı
    private Double averageRating; // Ortalama puan (servis katmanında hesaplanabilir)
}