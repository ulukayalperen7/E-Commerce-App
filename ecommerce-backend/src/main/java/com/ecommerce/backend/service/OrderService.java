package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.OrderRequestDto;
import com.ecommerce.backend.dto.response.OrderResponseDto;
import com.ecommerce.backend.dto.response.OrderSummaryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    // Sepetten sipariş oluşturma (Ödeme öncesi)
    OrderResponseDto createOrderFromCart(Integer userId, OrderRequestDto orderRequestDto);

    OrderResponseDto getOrderByIdAndUserId(Integer orderId, Integer userId);
    OrderResponseDto getOrderByIdForAdmin(Integer orderId); // Admin için yetki kontrolüyle

    Page<OrderSummaryResponseDto> getOrdersByUserId(Integer userId, Pageable pageable);
    Page<OrderSummaryResponseDto> getAllOrdersForAdmin(Pageable pageable); // Admin için

    // Sipariş durumunu güncelleme (genellikle PaymentService veya admin tarafından tetiklenir)
    OrderResponseDto updateOrderStatus(Integer orderId, String newStatus); // Admin veya sistem kullanabilir
    // OrderResponseDto cancelOrder(Integer orderId, Integer userId); // Kullanıcının kendi siparişini iptali
}   