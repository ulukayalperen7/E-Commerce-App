package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.ReviewRequestDto;
import com.ecommerce.backend.dto.response.ReviewResponseDto;
import com.ecommerce.backend.dto.response.UserSummaryResponseDto;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ForbiddenException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UniqueConstraintException;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ReviewResponseDto addReviewToProduct(Integer productId, Integer userId, ReviewRequestDto reviewRequestDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (reviewRepository.existsByProductAndUser(product, user)) {
            throw new UniqueConstraintException("You have already submitted a review for this product.");
        }

        Review review = modelMapper.map(reviewRequestDto, Review.class);
        review.setProduct(product);
        review.setUser(user);
        review.setReviewId(null); // Yeni kayıt olduğu için ID null

        Review savedReview = reviewRepository.save(review);
        return mapToReviewResponseDto(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDto getReviewById(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        return mapToReviewResponseDto(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getReviewsByProductId(Integer productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        Page<Review> reviewsPage = reviewRepository.findByProduct(product, pageable);
        return reviewsPage.map(this::mapToReviewResponseDto);
    }

    @Override
    @Transactional
    public ReviewResponseDto updateReview(Integer reviewId, Integer userId, ReviewRequestDto reviewRequestDto) {
        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!existingReview.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to update this review.");
        }

        existingReview.setRating(reviewRequestDto.getRating());
        existingReview.setComment(reviewRequestDto.getComment());

        Review updatedReview = reviewRepository.save(existingReview);
        return mapToReviewResponseDto(updatedReview);
    }

    @Override
    @Transactional
    public void deleteReview(Integer reviewId, Integer userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to delete this review.");
        }
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public void deleteReviewByAdmin(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
        reviewRepository.delete(review);
    }

    // Helper metot
    private ReviewResponseDto mapToReviewResponseDto(Review review) {
        ReviewResponseDto dto = modelMapper.map(review, ReviewResponseDto.class);
        dto.setProductId(review.getProduct().getProductId());
        if (review.getUser() != null) {
            dto.setUser(modelMapper.map(review.getUser(), UserSummaryResponseDto.class));
        }
        return dto;
    }
}