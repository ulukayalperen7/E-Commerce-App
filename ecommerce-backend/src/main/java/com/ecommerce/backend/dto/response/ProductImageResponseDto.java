package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductImageResponseDto {
    private Integer productImageId;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}