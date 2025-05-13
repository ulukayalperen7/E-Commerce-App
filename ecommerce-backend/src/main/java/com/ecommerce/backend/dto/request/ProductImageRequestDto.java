package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProductImageRequestDto {
    @NotBlank(message = "Image URL cannot be blank")
    @Size(max = 255)
    private String imageUrl;

    @Size(max = 255)
    private String altText;

    private Integer displayOrder = 0;
}