package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.ProductImageRequestDto;
import com.ecommerce.backend.dto.request.ProductRequestDto;
import com.ecommerce.backend.dto.response.ProductResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import org.springframework.data.domain.Page; // Spring Data Page
import org.springframework.data.domain.Pageable;
// MultipartFile için import gerekli değil eğer ProductImageRequestDto içinde URL alıyorsak
// ama direkt dosya yükleme olacaksa service metodunda MultipartFile alırız.
// Şimdilik ProductRequestDto'daki ProductImageRequestDto'ya göre gidelim.
// import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {
    ProductResponseDto createProduct(ProductRequestDto productRequestDto);

    ProductResponseDto getProductById(Integer productId);
    // ProductResponseDto getProductBySlug(String slug);
     public Page<ProductSummaryResponseDto> getProductsByCurrentSeller(Pageable pageable);
    Page<ProductSummaryResponseDto> getAllActiveProducts(Pageable pageable);
    Page<ProductSummaryResponseDto> getActiveProductsByCategory(Integer categoryId, Pageable pageable);
    Page<ProductSummaryResponseDto> getActiveProductsByBrand(Integer brandId, Pageable pageable);
    Page<ProductSummaryResponseDto> searchActiveProducts(String searchTerm, Integer categoryId, Integer brandId, Pageable pageable);

    ProductResponseDto updateProduct(Integer productId, ProductRequestDto productRequestDto);
    void deleteProduct(Integer productId);

    // Ürün resim yönetimi için metodlar
    // ProductRequestDto içinde additionalImages ile geldiği için ayrı addImageToProduct metoduna direkt gerek olmayabilir.
    // Veya var olan bir ürüne sonradan resim eklemek için ayrı bir metod olabilir:
    ProductResponseDto addImageToProduct(Integer productId, ProductImageRequestDto imageRequestDto); // URL ile ekleme
    ProductResponseDto addImageToProduct(Integer productId, MultipartFile imageFile, String altText, Integer displayOrder);
    // ProductResponseDto addImageToProduct(Integer productId, MultipartFile imageFile, String altText, Integer displayOrder); // Dosya ile ekleme
    void removeImageFromProduct(Integer productId, Integer productImageId);
    // ProductResponseDto setMainProductImage(Integer productId, String newMainImageUrl); // Ana resmi güncelleme
}