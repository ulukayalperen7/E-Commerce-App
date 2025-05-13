package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDto {
    private Integer paymentId;
    private String stripePaymentIntentId;
    private BigDecimal amount;
    private String currency;
    private String status; // Stripe ödeme durumu
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}