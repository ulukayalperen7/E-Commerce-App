package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.response.FavoriteResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteService {
    FavoriteResponseDto addProductToFavorites(Integer userId, Integer productId);
    Page<ProductSummaryResponseDto> getUserFavorites(Integer userId, Pageable pageable);
    void removeProductFromFavorites(Integer userId, Integer productId);
    boolean isProductFavoriteForUser(Integer userId, Integer productId);
}