package com.ecommerce.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping; // Eğer endpoint bazlı koruma istersen
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.request.CartItemRequestDto;
import com.ecommerce.backend.dto.response.CartResponseDto;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
// Eğer tüm sepet işlemleri sadece belirli bir rol içinse (örn: CUSTOMER),
// sınıf seviyesinde @PreAuthorize("hasRole('ROLE_CUSTOMER')") eklenebilir.
// Ama sen sadece login şartı istediğin için, SecurityConfig'deki anyRequest().authenticated() yeterli olacaktır.
public class CartController {

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    private final CartService cartService;
    private final UserService userService;

    private Integer getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal().toString())) {
            throw new BadRequestException("User not authenticated for cart operation.");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String && principal.toString().contains("@")) {
            email = (String) principal;
        } else {
             logger.error("Cannot extract email from principal type: {}", principal.getClass().getName());
            throw new IllegalStateException("Cannot extract user email from principal for cart operation.");
        }
        User user = userService.findUserByEmail(email);
        return user.getUserId();
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(Authentication authentication) {
        Integer userId = getAuthenticatedUserId(authentication);
        logger.debug("Getting cart for userId: {}", userId);
        CartResponseDto cart = cartService.getOrCreateCartForUser(userId, null);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDto> addItemToCart(
            @Valid @RequestBody CartItemRequestDto cartItemRequestDto,
            Authentication authentication) {
        Integer userId = getAuthenticatedUserId(authentication);
        logger.info("Adding item to cart for userId: {}, Payload: {}", userId, cartItemRequestDto);
        CartResponseDto updatedCart = cartService.addItemToCart(userId, null, cartItemRequestDto);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponseDto> updateCartItemQuantity(
            @PathVariable Integer productId,
            @RequestParam int quantity,
            Authentication authentication) {
        Integer userId = getAuthenticatedUserId(authentication);
        logger.info("Updating cart item for userId: {}, productId: {}, quantity: {}", userId, productId, quantity);
        CartResponseDto updatedCart = cartService.updateCartItemQuantity(userId, null, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponseDto> removeItemFromCart(
            @PathVariable Integer productId,
            Authentication authentication) {
        Integer userId = getAuthenticatedUserId(authentication);
        logger.info("Removing item from cart for userId: {}, productId: {}", userId, productId);
        CartResponseDto updatedCart = cartService.removeItemFromCart(userId, null, productId);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping
    public ResponseEntity<String> clearCart(Authentication authentication) {
        Integer userId = getAuthenticatedUserId(authentication);
        logger.info("Clearing cart for userId: {}", userId);
        cartService.clearCart(userId, null);
        return ResponseEntity.ok("Cart cleared successfully.");
    }
}