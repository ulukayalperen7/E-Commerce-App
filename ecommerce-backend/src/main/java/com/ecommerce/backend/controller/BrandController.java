package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.BrandRequestDto;
import com.ecommerce.backend.dto.response.BrandResponseDto;
import com.ecommerce.backend.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponseDto> createBrand(@Valid @RequestBody BrandRequestDto brandRequestDto) {
        BrandResponseDto createdBrand = brandService.createBrand(brandRequestDto);
        return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponseDto> getBrandById(@PathVariable("id") Integer brandId) {
        BrandResponseDto brand = brandService.getBrandById(brandId);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<BrandResponseDto> getBrandBySlug(@PathVariable("slug") String slug) {
        BrandResponseDto brand = brandService.getBrandBySlug(slug);
        return ResponseEntity.ok(brand);
    }

    @GetMapping
    public ResponseEntity<List<BrandResponseDto>> getAllBrands() {
        List<BrandResponseDto> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponseDto> updateBrand(
            @PathVariable("id") Integer brandId,
            @Valid @RequestBody BrandRequestDto brandRequestDto) {
        BrandResponseDto updatedBrand = brandService.updateBrand(brandId, brandRequestDto);
        return ResponseEntity.ok(updatedBrand);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteBrand(@PathVariable("id") Integer brandId) {
        brandService.deleteBrand(brandId);
        return ResponseEntity.ok("Brand deleted successfully with id: " + brandId);
    }
}