package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CartItemResponseDto {
    private Integer cartItemId;
    private ProductSummaryResponseDto product; // Ürün özet bilgisi
    private Integer quantity;
    private BigDecimal subtotal; // quantity * product.price
    private LocalDateTime addedAt;
}