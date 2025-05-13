package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.CartItemRequestDto;
import com.ecommerce.backend.dto.response.CartItemResponseDto;
import com.ecommerce.backend.dto.response.CartResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCartByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createNewCartForUser(user)); // Kullanıcının sepeti yoksa oluştur
        return mapCartToCartResponseDto(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDto getCartBySessionId(String sessionId) {
        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> createNewGuestCart(sessionId)); // Session için sepet yoksa oluştur
        return mapCartToCartResponseDto(cart);
    }

    @Override
    @Transactional
    public CartResponseDto getOrCreateCartForUser(Integer userId, String sessionId) {
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            Cart cart = cartRepository.findByUser(user).orElseGet(() -> createNewCartForUser(user));
            // Eğer kullanıcının sepeti varsa ve session ID'si de varsa, misafir sepetiyle birleştirme mantığı düşünülebilir
            // Ama bu genelde login sırasında yapılır (mergeGuestCartToUserCart)
            return mapCartToCartResponseDto(cart);
        } else if (sessionId != null && !sessionId.isEmpty()) {
            Cart cart = cartRepository.findBySessionId(sessionId).orElseGet(() -> createNewGuestCart(sessionId));
            return mapCartToCartResponseDto(cart);
        } else {
            // Yeni misafir sepeti oluştur ve yeni session ID ata
            String newSessionId = UUID.randomUUID().toString();
            Cart cart = createNewGuestCart(newSessionId);
            return mapCartToCartResponseDto(cart);
        }
    }


    @Override
    @Transactional
    public CartResponseDto addItemToCart(Integer userId, String sessionId, CartItemRequestDto cartItemRequestDto) {
        Cart cart = findOrCreateCart(userId, sessionId);
        Product product = productRepository.findById(cartItemRequestDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + cartItemRequestDto.getProductId()));

        if (!product.getIsActive() || product.getStockQuantity() < cartItemRequestDto.getQuantity()) {
            throw new BadRequestException("Product is not available or insufficient stock.");
        }

        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(product.getProductId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + cartItemRequestDto.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (product.getStockQuantity() < cartItemRequestDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(cartItemRequestDto.getQuantity());
            cart.getCartItems().add(cartItemRepository.save(newItem));
        }
        // cartRepository.save(cart); // CartItem save edildiği için cart da güncellenir (ilişki üzerinden)
        return mapCartToCartResponseDto(cartRepository.save(cart)); // Emin olmak için cart'ı tekrar save edip dön
    }

    @Override
    @Transactional
    public CartResponseDto updateCartItemQuantity(Integer userId, String sessionId, Integer productId, int quantity) {
        if (quantity <= 0) {
            return removeItemFromCart(userId, sessionId, productId);
        }
        Cart cart = findCart(userId, sessionId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart."));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return mapCartToCartResponseDto(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponseDto removeItemFromCart(Integer userId, String sessionId, Integer productId) {
        Cart cart = findCart(userId, sessionId);
        CartItem cartItemToRemove = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart."));

        cart.getCartItems().remove(cartItemToRemove);
        cartItemRepository.delete(cartItemToRemove); // Önce CartItem silinmeli
        return mapCartToCartResponseDto(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Integer userId, String sessionId) {
        Cart cart = findCart(userId, sessionId);
        // cartItemRepository.deleteAll(cart.getCartItems()); // Bu da bir yöntem
        cart.getCartItems().clear(); // İlişkili item'lar orphanRemoval=true ile silinecek
        cartRepository.save(cart); // Cart'ı save etmek item'ların silinmesini tetikler
    }

    @Override
    @Transactional
    public CartResponseDto mergeGuestCartToUserCart(Integer userId, String guestSessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Optional<Cart> guestCartOpt = cartRepository.findBySessionId(guestSessionId);

        if (guestCartOpt.isEmpty()) {
            return getCartByUserId(userId); // Misafir sepeti yoksa kullanıcının sepetini dön
        }

        Cart guestCart = guestCartOpt.get();
        Cart userCart = cartRepository.findByUser(user).orElseGet(() -> createNewCartForUser(user));

        // Eğer kullanıcının zaten bir sepeti varsa ve bu sepet misafir sepetiyle aynı değilse
        if (!userCart.getCartId().equals(guestCart.getCartId())) {
            for (CartItem guestItem : guestCart.getCartItems()) {
                Optional<CartItem> userCartItemOpt = userCart.getCartItems().stream()
                        .filter(item -> item.getProduct().getProductId().equals(guestItem.getProduct().getProductId()))
                        .findFirst();

                if (userCartItemOpt.isPresent()) {
                    CartItem userCartItem = userCartItemOpt.get();
                    int newQuantity = userCartItem.getQuantity() + guestItem.getQuantity();
                    if (guestItem.getProduct().getStockQuantity() < newQuantity) {
                        // Stok yetersizse, maksimum stok kadar ekle veya hata ver
                        userCartItem.setQuantity(guestItem.getProduct().getStockQuantity());
                    } else {
                        userCartItem.setQuantity(newQuantity);
                    }
                    cartItemRepository.save(userCartItem);
                } else {
                    CartItem newUserItem = new CartItem();
                    newUserItem.setCart(userCart);
                    newUserItem.setProduct(guestItem.getProduct());
                    newUserItem.setQuantity(guestItem.getQuantity());
                    userCart.getCartItems().add(cartItemRepository.save(newUserItem));
                }
            }
            cartRepository.save(userCart); // Kullanıcı sepetini güncelle
            cartRepository.delete(guestCart); // Misafir sepetini sil
            return mapCartToCartResponseDto(userCart);
        }
        // Eğer userCart ve guestCart aynıysa (örn. misafir sepeti kullanıcıya atanmışsa)
        // Sadece user'a bağla ve session ID'yi temizle
        guestCart.setUser(user);
        guestCart.setSessionId(null); // Misafir sepeti olmaktan çıkar
        return mapCartToCartResponseDto(cartRepository.save(guestCart));
    }

    // --- Helper Metotlar ---
    private Cart findOrCreateCart(Integer userId, String sessionId) {
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            return cartRepository.findByUser(user).orElseGet(() -> createNewCartForUser(user));
        } else if (sessionId != null && !sessionId.isEmpty()) {
            return cartRepository.findBySessionId(sessionId).orElseGet(() -> createNewGuestCart(sessionId));
        } else {
            throw new BadRequestException("User ID or Session ID must be provided to find or create a cart.");
        }
    }

    private Cart findCart(Integer userId, String sessionId) {
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            return cartRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user id: " + userId));
        } else if (sessionId != null && !sessionId.isEmpty()) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found for session id: " + sessionId));
        } else {
            throw new BadRequestException("User ID or Session ID must be provided to find a cart.");
        }
    }

    private Cart createNewCartForUser(User user) {
        Cart newCart = new Cart();
        newCart.setUser(user);
        return cartRepository.save(newCart);
    }

    private Cart createNewGuestCart(String sessionId) {
        Cart newCart = new Cart();
        newCart.setSessionId(sessionId);
        return cartRepository.save(newCart);
    }


    private CartResponseDto mapCartToCartResponseDto(Cart cart) {
        CartResponseDto dto = new CartResponseDto();
        dto.setCartId(cart.getCartId());
        if (cart.getUser() != null) {
            dto.setUserId(cart.getUser().getUserId());
        }
        dto.setSessionId(cart.getSessionId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        List<CartItemResponseDto> itemDtos = cart.getCartItems().stream()
                .map(this::mapCartItemToCartItemResponseDto)
                .collect(Collectors.toList());
        dto.setCartItems(itemDtos);

        dto.setTotalAmount(itemDtos.stream()
                .map(CartItemResponseDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setTotalItems(itemDtos.stream()
                .mapToInt(CartItemResponseDto::getQuantity)
                .sum());
        return dto;
    }

    private CartItemResponseDto mapCartItemToCartItemResponseDto(CartItem cartItem) {
        CartItemResponseDto dto = new CartItemResponseDto();
        dto.setCartItemId(cartItem.getCartItemId());
        dto.setProduct(modelMapper.map(cartItem.getProduct(), ProductSummaryResponseDto.class));
        dto.setQuantity(cartItem.getQuantity());
        if (cartItem.getProduct() != null && cartItem.getProduct().getPrice() != null) {
            dto.setSubtotal(cartItem.getProduct().getPrice().multiply(new BigDecimal(cartItem.getQuantity())));
        } else {
            dto.setSubtotal(BigDecimal.ZERO);
        }
        dto.setAddedAt(cartItem.getAddedAt());
        return dto;
    }
}