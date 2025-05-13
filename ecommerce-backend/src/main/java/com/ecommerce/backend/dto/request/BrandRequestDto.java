package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BrandRequestDto {

    @NotBlank(message = "Brand name cannot be blank")
    @Size(max = 100)
    private String name;
}