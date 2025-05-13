package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Bu DTO genellikle sepet ID'sini alır ve backend sepetten sipariş oluşturur.
// Veya direkt frontend'den sipariş kalemleri ve adres ID'si gelebilir.
// Şimdilik en basit haliyle adres ID'sini alalım, sepetin kullanıcıya ait olduğu varsayılır.
@Data
public class OrderRequestDto {

    @NotNull(message = "Shipping address ID cannot be null")
    private Integer shippingAddressId;

    // Opsiyonel: Eğer fatura adresi farklı olacaksa ve zorunluysa
    // @NotNull(message = "Billing address ID cannot be null")
    // private Integer billingAddressId;

    // Opsiyonel: Eğer ödeme yöntemi seçimi frontend'den geliyorsa
    // private String paymentMethod; // Örn: "stripe_card"

    // Not: Sipariş kalemleri (OrderItems) genellikle aktif sepetten alınır.
    // Bu yüzden bu DTO'da direkt olarak item listesi almayabiliriz.
    // Eğer sepet olmadan direkt sipariş oluşturma senaryosu varsa,
    // List<OrderItemRequestDto> items; gibi bir alan eklenebilir.
}