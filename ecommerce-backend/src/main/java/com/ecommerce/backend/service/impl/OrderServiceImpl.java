package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.OrderRequestDto;
import com.ecommerce.backend.dto.response.OrderItemResponseDto;
import com.ecommerce.backend.dto.response.OrderResponseDto;
import com.ecommerce.backend.dto.response.OrderSummaryResponseDto;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository; // Sepeti bulmak için
    private final ProductRepository productRepository; // Stok güncellemesi için
    private final PaymentRepository paymentRepository; // Ödeme detayı için
    private final ModelMapper modelMapper;
    // CartService'i direkt inject etmek yerine repository'ler üzerinden gitmek daha iyi olabilir
    // veya CartService'in sadece sepet getirme metodunu kullanabiliriz.
    private final CartService cartService;


    @Override
    @Transactional
    public OrderResponseDto createOrderFromCart(Integer userId, OrderRequestDto orderRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Address shippingAddress = addressRepository.findById(orderRequestDto.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found with id: " + orderRequestDto.getShippingAddressId()));

        // Kullanıcının adresini doğrula (opsiyonel ama iyi bir pratik)
        if (!shippingAddress.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("Shipping address does not belong to the user.");
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user. Cannot create order."));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Cannot create order.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setStatus("pending_payment"); // Siparişin ilk durumu ödeme bekliyor

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (!product.getIsActive() || product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Product '" + product.getName() + "' is not available or insufficient stock.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order); // İlişkiyi kur
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice()); // O anki fiyatı kaydet
            BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            orderItem.setSubtotalAmount(subtotal);

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);

            // Stok güncelleme (Ödeme başarılı olduktan SONRA yapılmalı, şimdilik burada bırakıyorum ama PaymentService'e taşınabilir)
            // product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            // productRepository.save(product);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order); // Bu, orderItems'ı da cascade ile save eder

        // Sepeti temizle (Ödeme başarılı olduktan SONRA yapılmalı)
        // cartService.clearCart(userId, null);

        logger.info("Order created with ID: {} for user ID: {}", savedOrder.getOrderId(), userId);
        return mapOrderToOrderResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByIdAndUserId(Integer orderId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Order order = orderRepository.findByOrderIdAndUser(orderId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId + " for this user."));
        return mapOrderToOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByIdForAdmin(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapOrderToOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponseDto> getOrdersByUserId(Integer userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Page<Order> ordersPage = orderRepository.findByUserOrderByOrderDateDesc(user, pageable);
        return ordersPage.map(this::mapOrderToOrderSummaryResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponseDto> getAllOrdersForAdmin(Pageable pageable) {
        Page<Order> ordersPage = orderRepository.findAllByOrderByOrderDateDesc(pageable);
        return ordersPage.map(this::mapOrderToOrderSummaryResponseDto);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Integer orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Burada status geçişleri için bir mantık olabilir (örn: pending_payment -> processing olabilir ama delivered -> pending_payment olamaz)
        // Örnek: if (!isValidStatusTransition(order.getStatus(), newStatus)) { throw new BadRequestException("Invalid status transition"); }

        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        logger.info("Order ID: {} status updated from {} to {}", orderId, oldStatus, newStatus);

        // Eğer ödeme başarılı olduysa ve status 'processing'e geçtiyse:
        if ("processing".equalsIgnoreCase(newStatus) && !"processing".equalsIgnoreCase(oldStatus)) {
            // Stokları düşür
            updatedOrder.getOrderItems().forEach(item -> {
                Product product = item.getProduct();
                int newStock = product.getStockQuantity() - item.getQuantity();
                if (newStock < 0) {
                    logger.warn("Stock became negative for product ID: {} during order processing for order ID: {}. This should not happen if stock was checked before.", product.getProductId(), orderId);
                    // Hata fırlatılabilir veya negatif stoğa izin veriliyorsa loglanıp geçilebilir.
                    product.setStockQuantity(0); // En azından 0 yap
                } else {
                    product.setStockQuantity(newStock);
                }
                productRepository.save(product);
            });

            // Sepeti temizle (Eğer sipariş sepetten oluşturulduysa ve kullanıcıya aitse)
            if (updatedOrder.getUser() != null) {
                cartRepository.findByUser(updatedOrder.getUser()).ifPresent(cart -> {
                    cartService.clearCart(updatedOrder.getUser().getUserId(), null);
                    logger.info("Cart cleared for user ID: {} after order ID: {} processed.", updatedOrder.getUser().getUserId(), orderId);
                });
            }
        }


        return mapOrderToOrderResponseDto(updatedOrder);
    }


    // --- Helper Metotlar ---
    private OrderResponseDto mapOrderToOrderResponseDto(Order order) {
        OrderResponseDto dto = modelMapper.map(order, OrderResponseDto.class);
        // ModelMapper ilişkili entity'leri DTO'lara mapleyemeyebilir, elle yapmak gerekebilir
        if (order.getUser() != null) {
            dto.setUser(modelMapper.map(order.getUser(), com.ecommerce.backend.dto.response.UserSummaryResponseDto.class));
        }
        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(modelMapper.map(order.getShippingAddress(), com.ecommerce.backend.dto.response.AddressResponseDto.class));
        }
        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                    .map(item -> {
                        OrderItemResponseDto itemDto = modelMapper.map(item, OrderItemResponseDto.class);
                        if (item.getProduct() != null) {
                            itemDto.setProduct(modelMapper.map(item.getProduct(), com.ecommerce.backend.dto.response.ProductSummaryResponseDto.class));
                        }
                        return itemDto;
                    })
                    .collect(Collectors.toList()));
        }
        // Ödeme detayını ekle
        paymentRepository.findByOrder(order).ifPresent(payment ->
            dto.setPaymentDetails(modelMapper.map(payment, com.ecommerce.backend.dto.response.PaymentResponseDto.class))
        );

        return dto;
    }

    private OrderSummaryResponseDto mapOrderToOrderSummaryResponseDto(Order order) {
        OrderSummaryResponseDto dto = modelMapper.map(order, OrderSummaryResponseDto.class);
        if (order.getOrderItems() != null) {
            dto.setTotalItems(order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum());
        } else {
            dto.setTotalItems(0);
        }
        return dto;
    }
}