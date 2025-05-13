package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponseDto {
    private Integer reviewId;
    private Integer productId;
    private UserSummaryResponseDto user; // Yorumu yapan kullanıcı hakkında özet bilgi
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}