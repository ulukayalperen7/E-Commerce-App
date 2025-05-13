package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.ReviewRequestDto;
import com.ecommerce.backend.dto.response.ReviewResponseDto;
import com.ecommerce.backend.service.ReviewService;
import com.ecommerce.backend.service.UserService; // Mevcut kullanıcı ID'sini almak için
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
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    // Helper metot: Authentication'dan kullanıcı ID'sini alır
    private Integer getCurrentUserId(Authentication authentication) {
        return userService.getCurrentAuthenticatedUser().getUserId();
    }

    // Ürüne yorum ekleme
    @PostMapping("/products/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')") // Sadece müşteri yorum yapabilir
    public ResponseEntity<ReviewResponseDto> addReview(
            @PathVariable Integer productId,
            @Valid @RequestBody ReviewRequestDto reviewRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        ReviewResponseDto createdReview = reviewService.addReviewToProduct(productId, userId, reviewRequestDto);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    // Belirli bir yorumu ID ile getir (herkes görebilir)
    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponseDto> getReviewById(@PathVariable Integer reviewId) {
        ReviewResponseDto review = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(review);
    }

    // Bir ürünün tüm yorumlarını listele (sayfalı)
    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewResponseDto>> getReviewsByProductId(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) { // En yeni yorumlar önde

        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "desc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ReviewResponseDto> reviewsPage = reviewService.getReviewsByProductId(productId, pageable);
        return ResponseEntity.ok(reviewsPage);
    }

    // Kullanıcının kendi yorumunu güncelleme
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponseDto> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewRequestDto reviewRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        ReviewResponseDto updatedReview = reviewService.updateReview(reviewId, userId, reviewRequestDto);
        return ResponseEntity.ok(updatedReview);
    }

    // Kullanıcının kendi yorumunu silme
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> deleteReview(
            @PathVariable Integer reviewId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok("Review deleted successfully.");
    }

    // Admin: Herhangi bir yorumu silme
    @DeleteMapping("/admin/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteReviewByAdmin(@PathVariable Integer reviewId) {
        reviewService.deleteReviewByAdmin(reviewId);
        return ResponseEntity.ok("Review deleted by admin successfully.");
    }
}