package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.CategoryRequestDto;
import com.ecommerce.backend.dto.response.CategoryResponseDto;
import java.util.List;

public interface CategoryService {
    CategoryResponseDto createCategory(CategoryRequestDto categoryRequestDto);
    CategoryResponseDto getCategoryById(Integer categoryId);
    CategoryResponseDto getCategoryBySlug(String slug);
    List<CategoryResponseDto> getAllCategories();
    CategoryResponseDto updateCategory(Integer categoryId, CategoryRequestDto categoryRequestDto);
    void deleteCategory(Integer categoryId);
}