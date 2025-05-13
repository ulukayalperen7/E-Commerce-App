package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.CategoryRequestDto;
import com.ecommerce.backend.dto.response.CategoryResponseDto;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UniqueConstraintException;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.service.CategoryService;
import com.github.slugify.Slugify; // Slugify kütüphanesi için (pom.xml'e eklenmeli)
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper; // ModelMapper kütüphanesi için (pom.xml'e eklenmeli)
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper; // DTO dönüşümleri için
    private final Slugify slugify;         // Slug oluşturmak için

    @Override
    @Transactional
    public CategoryResponseDto createCategory(CategoryRequestDto categoryRequestDto) {
        String slug = slugify.slugify(categoryRequestDto.getName());
        if (categoryRepository.existsByName(categoryRequestDto.getName())) {
            throw new UniqueConstraintException("Category with name '" + categoryRequestDto.getName() + "' already exists.");
        }
        if (categoryRepository.existsBySlug(slug)) {
            // Farklı isim ama aynı slug durumu, slug'a bir ek yapılabilir veya hata verilebilir
            throw new UniqueConstraintException("Category with generated slug '" + slug + "' already exists. Try a different name.");
        }

        Category category = new Category();
        category.setName(categoryRequestDto.getName());
        category.setSlug(slug);
        // parent_category_id kaldırıldığı için o kısım yok

        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryResponseDto.class);
    }

    @Override
    public CategoryResponseDto getCategoryById(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        return modelMapper.map(category, CategoryResponseDto.class);
    }

    @Override
    public CategoryResponseDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return modelMapper.map(category, CategoryResponseDto.class);
    }

    @Override
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> modelMapper.map(category, CategoryResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponseDto updateCategory(Integer categoryId, CategoryRequestDto categoryRequestDto) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        // İsim değişikliği varsa slug'ı da güncelle
        if (!existingCategory.getName().equals(categoryRequestDto.getName())) {
            String newSlug = slugify.slugify(categoryRequestDto.getName());
            // İsim ve slug unique kontrolü (kendisi hariç)
            categoryRepository.findByName(categoryRequestDto.getName()).ifPresent(cat -> {
                if (!cat.getCategoryId().equals(categoryId)) {
                    throw new UniqueConstraintException("Category with name '" + categoryRequestDto.getName() + "' already exists.");
                }
            });
            categoryRepository.findBySlug(newSlug).ifPresent(cat -> {
                if (!cat.getCategoryId().equals(categoryId)) {
                    throw new UniqueConstraintException("Category with generated slug '" + newSlug + "' already exists. Try a different name.");
                }
            });
            existingCategory.setSlug(newSlug);
        }

        existingCategory.setName(categoryRequestDto.getName());
        // Diğer güncellenecek alanlar varsa...

        Category updatedCategory = categoryRepository.save(existingCategory);
        return modelMapper.map(updatedCategory, CategoryResponseDto.class);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        // Kategoriye bağlı ürünler varsa ne yapılacağına karar verilmeli (RESTRICT olduğu için silinemez).
        // Ya önce ürünlerin kategorisi değiştirilmeli ya da bu operasyon engellenmeli.
        // Şimdilik JPA foreign key kısıtlamasına (ON DELETE RESTRICT) güveniyoruz.
        // Eğer silinmesi gerekiyorsa, ürünlerin category_id'si null yapılabilir (eğer nullable ise)
        // veya bağlı ürünler varsa hata fırlatılabilir.
        if (!category.getProducts().isEmpty()) { // JPA ilişkisi üzerinden kontrol
             throw new BadRequestException("Cannot delete category. It has associated products.");
        }
        categoryRepository.delete(category);
    }
}