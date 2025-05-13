package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
// Bu DTO, payment intent oluşturma API'sine istek için değil,
// daha çok servis katmanında ödeme sürecini başlatmak için bir orderId alabilir.
// Veya frontend ödeme sayfasına geçmeden önce orderId gönderir.
@Data
public class PaymentIntentRequestDto {
    @NotNull(message = "Order ID cannot be null")
    private Integer orderId;
    // para birimi gibi bilgiler backend'de order'dan veya config'den alınabilir.
}