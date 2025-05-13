package com.ecommerce.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.request.FavoriteRequestDto;
import com.ecommerce.backend.dto.response.FavoriteResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import com.ecommerce.backend.service.FavoriteService;
import com.ecommerce.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_CUSTOMER')") // Favori işlemleri sadece CUSTOMER için
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    // Helper metot: Authentication'dan kullanıcı ID'sini alır
    private Integer getCurrentUserId(Authentication authentication) {
        return userService.getCurrentAuthenticatedUser().getUserId();
    }

    // Ürünü favorilere ekle
    @PostMapping
    public ResponseEntity<FavoriteResponseDto> addProductToFavorites(
            @Valid @RequestBody FavoriteRequestDto favoriteRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        FavoriteResponseDto addedFavorite = favoriteService.addProductToFavorites(userId, favoriteRequestDto.getProductId());
        return new ResponseEntity<>(addedFavorite, HttpStatus.CREATED);
    }

    // Kullanıcının favori ürünlerini listele
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponseDto>> getUserFavorites(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) { // Favoriye eklenme tarihine göre sırala

        Integer userId = getCurrentUserId(authentication);
        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ProductSummaryResponseDto> favoritesPage = favoriteService.getUserFavorites(userId, pageable);
        return ResponseEntity.ok(favoritesPage);
    }

    // Ürünü favorilerden çıkar
    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeProductFromFavorites(
            @PathVariable Integer productId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        favoriteService.removeProductFromFavorites(userId, productId);
        return ResponseEntity.ok("Product removed from favorites successfully.");
    }

    // Bir ürünün kullanıcının favorisi olup olmadığını kontrol et
    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isProductFavoriteForUser(
            @PathVariable Integer productId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        boolean isFavorite = favoriteService.isProductFavoriteForUser(userId, productId);
        return ResponseEntity.ok(isFavorite);
    }
}