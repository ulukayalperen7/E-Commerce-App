package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.CartItemRequestDto;
import com.ecommerce.backend.dto.response.CartResponseDto;

public interface CartService {
    CartResponseDto getCartByUserId(Integer userId);
    CartResponseDto getCartBySessionId(String sessionId); // Misafir kullanıcılar için
    CartResponseDto getOrCreateCartForUser(Integer userId, String sessionId); // Kullanıcı veya session'a göre sepet getirir/oluşturur

    CartResponseDto addItemToCart(Integer userId, String sessionId, CartItemRequestDto cartItemRequestDto);
    CartResponseDto updateCartItemQuantity(Integer userId, String sessionId, Integer productId, int quantity);
    CartResponseDto removeItemFromCart(Integer userId, String sessionId, Integer productId);
    void clearCart(Integer userId, String sessionId);
    CartResponseDto mergeGuestCartToUserCart(Integer userId, String guestSessionId); // Giriş yapınca misafir sepetini birleştir
}