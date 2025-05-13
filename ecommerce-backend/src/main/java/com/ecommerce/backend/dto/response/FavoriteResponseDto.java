package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FavoriteResponseDto {
    private Integer favoriteId;
    private UserSummaryResponseDto user; // veya sadece userId
    private ProductSummaryResponseDto product;
    private LocalDateTime createdAt;
}