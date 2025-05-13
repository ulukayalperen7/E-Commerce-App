package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BannerResponseDto {
    private Integer bannerId;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Boolean isActive;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}