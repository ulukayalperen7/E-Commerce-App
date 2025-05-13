package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.OrderRequestDto;
import com.ecommerce.backend.dto.response.OrderResponseDto;
import com.ecommerce.backend.dto.response.OrderSummaryResponseDto;
import com.ecommerce.backend.entity.User; // Eğer Principal User entity'si ise
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.UserService; // Veya UserResponseDto almak için
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService; // Mevcut kullanıcının ID'sini almak için

    // Helper metot: Authentication'dan kullanıcı ID'sini alır
    private Integer getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            // Bu durumun olmaması gerekir @PreAuthorize("isAuthenticated()") ile korunan endpointlerde
            throw new IllegalStateException("User must be authenticated for this operation.");
        }
        // UserServiceImpl'deki getCurrentAuthenticatedUser metodu UserResponseDto dönüyordu.
        // Ondan ID'yi alabiliriz.
        // Ya da JwtAuthFilter'da User entity'sini Principal olarak set ettiysek:
        // User userPrincipal = (User) authentication.getPrincipal();
        // return userPrincipal.getUserId();
        // Şimdilik UserService üzerinden gidelim (daha önce oluşturduğumuz UserResponseDto dönecek şekilde)
        return userService.getCurrentAuthenticatedUser().getUserId();
    }

    // Kullanıcının sepetinden yeni bir sipariş oluştur (Ödeme öncesi)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDto> createOrderFromCart(
            @Valid @RequestBody OrderRequestDto orderRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        OrderResponseDto createdOrder = orderService.createOrderFromCart(userId, orderRequestDto);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    // Kullanıcının belirli bir siparişini getir
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDto> getOrderByIdForUser(
            @PathVariable Integer orderId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        OrderResponseDto order = orderService.getOrderByIdAndUserId(orderId, userId);
        return ResponseEntity.ok(order);
    }

    // Kullanıcının tüm siparişlerini listele (sayfalı)
    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderSummaryResponseDto>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate,desc") String[] sort) {
        Integer userId = getCurrentUserId(authentication);
        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<OrderSummaryResponseDto> ordersPage = orderService.getOrdersByUserId(userId, pageable);
        return ResponseEntity.ok(ordersPage);
    }


    // --- Admin Endpoint'leri ---

    // Admin: Tüm siparişleri listele (sayfalı)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderSummaryResponseDto>> getAllOrdersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate,desc") String[] sort) {
        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<OrderSummaryResponseDto> ordersPage = orderService.getAllOrdersForAdmin(pageable);
        return ResponseEntity.ok(ordersPage);
    }

    // Admin: Belirli bir siparişin detayını getir
    @GetMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDto> getOrderByIdForAdmin(@PathVariable Integer orderId) {
        OrderResponseDto order = orderService.getOrderByIdForAdmin(orderId);
        return ResponseEntity.ok(order);
    }

    // Admin: Sipariş durumunu güncelle
    @PatchMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestParam String newStatus) { // Veya @RequestBody ile daha detaylı bir DTO alınabilir
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, newStatus);
        return ResponseEntity.ok(updatedOrder);
    }

    // Sipariş iptali gibi işlemler için de endpoint'ler eklenebilir
    // @PostMapping("/{orderId}/cancel")
    // @PreAuthorize("isAuthenticated()")
    // public ResponseEntity<?> cancelOrder(@PathVariable Integer orderId, Authentication authentication) { ... }
}