package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.ReviewRequestDto;
import com.ecommerce.backend.dto.response.ReviewResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponseDto addReviewToProduct(Integer productId, Integer userId, ReviewRequestDto reviewRequestDto);
    ReviewResponseDto getReviewById(Integer reviewId);
    Page<ReviewResponseDto> getReviewsByProductId(Integer productId, Pageable pageable);
    ReviewResponseDto updateReview(Integer reviewId, Integer userId, ReviewRequestDto reviewRequestDto); // Sadece kendi yorumunu güncelleyebilir
    void deleteReview(Integer reviewId, Integer userId); // Sadece kendi yorumunu silebilir
    void deleteReviewByAdmin(Integer reviewId); // Admin her yorumu silebilir
}