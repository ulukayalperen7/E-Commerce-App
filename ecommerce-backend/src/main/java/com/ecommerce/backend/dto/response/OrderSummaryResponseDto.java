package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderSummaryResponseDto {
    private Integer orderId;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private Integer totalItems; // Siparişteki toplam ürün adedi (servis katmanında hesaplanabilir)
}