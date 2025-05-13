package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDto {
    private Integer orderId;
    private UserSummaryResponseDto user;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private AddressResponseDto shippingAddress;
    // private AddressResponseDto billingAddress; // Eğer varsa
    private List<OrderItemResponseDto> orderItems;
    private PaymentResponseDto paymentDetails; // Ödeme bilgileri
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}