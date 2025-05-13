package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.BrandRequestDto;
import com.ecommerce.backend.dto.response.BrandResponseDto;
import java.util.List;

public interface BrandService {
    BrandResponseDto createBrand(BrandRequestDto brandRequestDto);
    BrandResponseDto getBrandById(Integer brandId);
    BrandResponseDto getBrandBySlug(String slug);
    List<BrandResponseDto> getAllBrands();
    BrandResponseDto updateBrand(Integer brandId, BrandRequestDto brandRequestDto);
    void deleteBrand(Integer brandId);
}