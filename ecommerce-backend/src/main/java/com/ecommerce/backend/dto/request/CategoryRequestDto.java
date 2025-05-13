package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequestDto {

    @NotBlank(message = "Category name cannot be blank")
    @Size(max = 100)
    private String name;

    // Slug genellikle backend'de name'den otomatik oluşturulur,
    // ama istenirse client'tan da alınabilir.
    // @NotBlank
    // @Size(max = 150)
    // private String slug;
}