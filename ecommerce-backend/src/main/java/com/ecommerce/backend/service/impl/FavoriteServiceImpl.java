package com.ecommerce.backend.service.impl;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.dto.response.FavoriteResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import com.ecommerce.backend.entity.Favorite;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UniqueConstraintException; // SLF4J Logger importu
import com.ecommerce.backend.repository.FavoriteRepository; // SLF4J LoggerFactory importu
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.FavoriteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    // Logger'ı bu sınıf için tanımla
    private static final Logger logger = LoggerFactory.getLogger(FavoriteServiceImpl.class);

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public FavoriteResponseDto addProductToFavorites(Integer userId, Integer productId) {
        logger.info("Attempting to add favorite: userId={}, productId={}", userId, productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {} when trying to add favorite.", userId);
                    return new ResourceNotFoundException("User not found with id: " + userId);
                });
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Product not found with id: {} when trying to add favorite.", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });

        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            logger.warn("Product {} is already in favorites for user {}.", productId, userId);
            throw new UniqueConstraintException("Product is already in favorites for this user.");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);

        Favorite savedFavorite = favoriteRepository.save(favorite);
        logger.info("Product {} added to favorites for user {} successfully. FavoriteId: {}", productId, userId, savedFavorite.getFavoriteId());
        return mapToFavoriteResponseDto(savedFavorite);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponseDto> getUserFavorites(Integer userId, Pageable pageable) {
        logger.debug("Fetching favorites for userId: {}, pageable: {}", userId, pageable);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Page<Favorite> favoritesPage = favoriteRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        logger.debug("Found {} favorite entries for user {}.", favoritesPage.getTotalElements(), userId);
        return favoritesPage.map(favorite -> modelMapper.map(favorite.getProduct(), ProductSummaryResponseDto.class));
    }

    @Override
    @Transactional
    public void removeProductFromFavorites(Integer userId, Integer productId) {
        logger.info("Attempting to remove favorite: userId={}, productId={}", userId, productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {} when trying to remove favorite.", userId);
                    return new ResourceNotFoundException("User not found with id: " + userId);
                });
        logger.debug("User found for favorite removal: {}", user.getEmail());
    
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> {
                    logger.error("Product not found with id: {} when trying to remove favorite.", productId);
                    return new ResourceNotFoundException("Product not found with id: " + productId);
                });
        logger.debug("Product found for favorite removal: {}", product.getName());
    
        if (!favoriteRepository.existsByUserAndProduct(user, product)) {
            logger.warn("Product {} is not in favorites for user {}. Nothing to remove.", productId, userId);
            throw new ResourceNotFoundException("Product is not in favorites for this user. Cannot remove.");
        }
        logger.info("Favorite entry exists for user {} and product {}. Proceeding with deletion.", userId, productId);
        favoriteRepository.deleteByUserAndProduct(user, product);
        logger.info("Product {} removed from favorites for user {} successfully.", productId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProductFavoriteForUser(Integer userId, Integer productId) {
        logger.debug("Checking if product {} is favorite for user {}", productId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        boolean isFavorite = favoriteRepository.existsByUserAndProduct(user, product);
        logger.debug("Product {} is favorite for user {}: {}", productId, userId, isFavorite);
        return isFavorite;
    }

    private FavoriteResponseDto mapToFavoriteResponseDto(Favorite favorite) {
        FavoriteResponseDto dto = modelMapper.map(favorite, FavoriteResponseDto.class);
        if (favorite.getUser() != null) {
            dto.setUser(modelMapper.map(favorite.getUser(), com.ecommerce.backend.dto.response.UserSummaryResponseDto.class));
        }
        if (favorite.getProduct() != null) {
            dto.setProduct(modelMapper.map(favorite.getProduct(), com.ecommerce.backend.dto.response.ProductSummaryResponseDto.class));
        }
        return dto;
    }
}