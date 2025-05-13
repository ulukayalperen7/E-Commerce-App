package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BannerRequestDto {
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Image URL cannot be blank")
    @Size(max = 255)
    private String imageUrl;

    @Size(max = 255)
    private String linkUrl;

    private Boolean isActive = true;
    private Integer displayOrder = 0;
}