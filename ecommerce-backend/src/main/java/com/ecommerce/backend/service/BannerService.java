package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.BannerRequestDto;
import com.ecommerce.backend.dto.response.BannerResponseDto;
import org.springframework.web.multipart.MultipartFile; // Resim yükleme için
import java.util.List;

public interface BannerService {
    BannerResponseDto createBanner(BannerRequestDto bannerRequestDto, MultipartFile imageFile);
    BannerResponseDto getBannerById(Integer bannerId);
    List<BannerResponseDto> getAllActiveBanners();
    List<BannerResponseDto> getAllBannersForAdmin(); // Admin için tüm bannerlar (aktif/pasif)
    BannerResponseDto updateBanner(Integer bannerId, BannerRequestDto bannerRequestDto, MultipartFile imageFile);
    void deleteBanner(Integer bannerId);
}