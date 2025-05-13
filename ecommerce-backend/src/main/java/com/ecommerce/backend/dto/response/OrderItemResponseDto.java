package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponseDto {
    private Integer orderItemId;
    private ProductSummaryResponseDto product; // Ürün özet bilgisi
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal subtotalAmount;
}