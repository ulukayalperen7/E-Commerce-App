package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List; // Resim URL'leri veya ProductImageRequestDto listesi için

@Data
public class ProductRequestDto {

    @NotBlank(message = "Product name cannot be blank")
    @Size(max = 255)
    private String name;

    @Size(max = 5000) // Veya daha fazla, TEXT tipine uygun
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Category ID cannot be null")
    private Integer categoryId;

    @NotNull(message = "Brand ID cannot be null")
    private Integer brandId;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity = 0;

    @Size(max = 255)
    private String imageUrl; // Ana resim URL'si

    // Birden fazla resim eklemek için ProductImageRequestDto listesi
    private List<ProductImageRequestDto> additionalImages;

    private Boolean isActive = true;
}