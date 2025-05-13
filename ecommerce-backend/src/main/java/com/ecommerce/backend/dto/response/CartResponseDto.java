package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CartResponseDto {
    private Integer cartId;
    private Integer userId; // Veya UserSummaryResponseDto
    private String sessionId;
    private List<CartItemResponseDto> cartItems;
    private BigDecimal totalAmount; // Sepetin toplam tutarı (servis katmanında hesaplanacak)
    private Integer totalItems; // Sepetteki toplam ürün adedi (servis katmanında hesaplanacak)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}