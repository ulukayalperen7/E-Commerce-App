package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FavoriteRequestDto {
    @NotNull(message = "Product ID cannot be null")
    private Integer productId;
}