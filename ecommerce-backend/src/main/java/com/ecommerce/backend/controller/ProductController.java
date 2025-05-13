package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.ProductImageRequestDto; // Resim ekleme için
import com.ecommerce.backend.dto.request.ProductRequestDto;
import com.ecommerce.backend.dto.response.ProductResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import com.ecommerce.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // Resim yükleme için
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // Resim dosyası almak için

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // --- Admin Endpoint'leri ---
    @PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')") // <<< GÜNCELLENDİ
public ResponseEntity<ProductResponseDto> createProduct(@Valid @RequestBody ProductRequestDto productRequestDto) {
    // Servis katmanı o anki kullanıcıyı alıp seller olarak atayacak
    ProductResponseDto createdProduct = productService.createProduct(productRequestDto);
    return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
}

    // Admin: Ürünü güncelleme
    @PutMapping("/{productId}")
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')") // <<< GÜNCELLENDİ
public ResponseEntity<ProductResponseDto> updateProduct(
        @PathVariable Integer productId,
        @Valid @RequestBody ProductRequestDto productRequestDto) {
    // Servis katmanı yetki kontrolü yapacak (admin veya kendi ürünü olan seller)
    ProductResponseDto updatedProduct = productService.updateProduct(productId, productRequestDto);
    return ResponseEntity.ok(updatedProduct);
}

    // Admin: Ürünü silme
    @DeleteMapping("/{productId}")
@PreAuthorize("hasAnyRole('ADMIN', 'SELLER')") // <<< GÜNCELLENDİ
public ResponseEntity<String> deleteProduct(@PathVariable Integer productId) {
    // Servis katmanı yetki kontrolü yapacak
    productService.deleteProduct(productId);
    return ResponseEntity.ok("Product deleted successfully with id: " + productId);
}
    // Admin: Var olan bir ürüne resim ekleme (MultipartFile ile)
    // Bu endpoint, ProductRequestDto'daki additionalImages'e alternatif veya ek olarak kullanılabilir.
    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponseDto> addImageToProduct(
            @PathVariable Integer productId,
            @RequestParam("file") MultipartFile imageFile, // Resim dosyası
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder) {
        // ProductService'de bu imzaya uygun bir metot olmalı:
        // ProductResponseDto addImageToProduct(Integer productId, MultipartFile imageFile, String altText, Integer displayOrder);
        // Şimdilik ProductServiceImpl'de URL ile ekleme metodu vardı, bunu MultipartFile alacak şekilde güncellemek gerekir.
        // Geçici olarak, ProductImageRequestDto kullanan servisi çağıralım (dosya yükleme mantığını servise taşımak daha iyi)
        
        // ÖNEMLİ: ProductService'deki addImageToProduct metodunu MultipartFile alacak şekilde güncellemeniz gerekecek.
        // ProductServiceImpl'deki storeFile metodu bu iş için kullanılabilir.
        // Aşağıdaki satır, ProductService'de MultipartFile alan bir metod olduğunu varsayar.
        ProductResponseDto updatedProduct = productService.addImageToProduct(productId, imageFile, altText, displayOrder);
        return ResponseEntity.ok(updatedProduct);
    }


    // Admin: Üründen resim silme
    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> removeImageFromProduct(
            @PathVariable Integer productId,
            @PathVariable Integer imageId) {
        productService.removeImageFromProduct(productId, imageId);
        return ResponseEntity.ok("Product image deleted successfully.");
    }
     @GetMapping("/my-products")
 @PreAuthorize("hasRole('SELLER')")
 public ResponseEntity<Page<ProductSummaryResponseDto>> getMyProducts(
         @RequestParam(defaultValue = "0") int page,
         @RequestParam(defaultValue = "10") int size,
         @RequestParam(defaultValue = "productId,asc") String[] sort) {
     Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sort[1]), sort[0]));
     Page<ProductSummaryResponseDto> productsPage = productService.getProductsByCurrentSeller(pageable); // ProductService'e eklenecek metot
   return ResponseEntity.ok(productsPage);
 }

    // --- Public Endpoint'ler (Herkes Erişebilir) ---

    // Tüm aktif ürünleri sayfalayarak listeleme
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponseDto>> getAllActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "productId,asc") String[] sort) { // Örn: sort=name,desc veya sort=price,asc

        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "asc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ProductSummaryResponseDto> productsPage = productService.getAllActiveProducts(pageable);
        return ResponseEntity.ok(productsPage);
    }

    // ID ile ürün detayı getirme
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDto> getProductById(@PathVariable Integer productId) {
        ProductResponseDto product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    // Kategori ID'sine göre aktif ürünleri listeleme
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductSummaryResponseDto>> getActiveProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "productId,asc") String[] sort) {

        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "asc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ProductSummaryResponseDto> productsPage = productService.getActiveProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(productsPage);
    }

    // Marka ID'sine göre aktif ürünleri listeleme
    @GetMapping("/brand/{brandId}")
    public ResponseEntity<Page<ProductSummaryResponseDto>> getActiveProductsByBrand(
            @PathVariable Integer brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "productId,asc") String[] sort) {

        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "asc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ProductSummaryResponseDto> productsPage = productService.getActiveProductsByBrand(brandId, pageable);
        return ResponseEntity.ok(productsPage);
    }

    // Ürün arama (isim, açıklama, kategori, marka ile)
    @GetMapping("/search")
    public ResponseEntity<Page<ProductSummaryResponseDto>> searchActiveProducts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort) { // Arama sonuçlarını isme göre sırala

        Sort.Direction direction = Sort.Direction.fromString(sort.length > 1 ? sort[1] : "asc");
        Sort.Order order = new Sort.Order(direction, sort[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Page<ProductSummaryResponseDto> productsPage = productService.searchActiveProducts(searchTerm, categoryId, brandId, pageable);
        return ResponseEntity.ok(productsPage);
    }
}