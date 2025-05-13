package com.ecommerce.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponseDto {
    private String clientSecret;
    private String paymentIntentId; // Referans için
    private String orderStatus; // Ödeme süreci sonrası siparişin güncel durumu
}