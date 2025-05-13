package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.BannerRequestDto;
import com.ecommerce.backend.dto.response.BannerResponseDto;
import com.ecommerce.backend.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Admin: Yeni banner oluşturma (resim dosyası ile)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponseDto> createBanner(
            @Valid @RequestPart("banner") BannerRequestDto bannerRequestDto, // JSON verisi
            @RequestPart("file") MultipartFile imageFile) { // Resim dosyası
        BannerResponseDto createdBanner = bannerService.createBanner(bannerRequestDto, imageFile);
        return new ResponseEntity<>(createdBanner, HttpStatus.CREATED);
    }

    // Admin: Banner'ı ID ile getir
    @GetMapping("/admin/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponseDto> getBannerByIdForAdmin(@PathVariable Integer bannerId) {
        BannerResponseDto banner = bannerService.getBannerById(bannerId);
        return ResponseEntity.ok(banner);
    }

    // Admin: Tüm banner'ları listele (aktif/pasif fark etmez)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BannerResponseDto>> getAllBannersForAdmin() {
        List<BannerResponseDto> banners = bannerService.getAllBannersForAdmin();
        return ResponseEntity.ok(banners);
    }

    // Public: Sadece aktif banner'ları listele (anasayfa, slider vb. için)
    @GetMapping("/active")
    public ResponseEntity<List<BannerResponseDto>> getAllActiveBanners() {
        List<BannerResponseDto> banners = bannerService.getAllActiveBanners();
        return ResponseEntity.ok(banners);
    }

    // Admin: Banner'ı güncelle
    @PutMapping(value = "/{bannerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponseDto> updateBanner(
            @PathVariable Integer bannerId,
            @Valid @RequestPart("banner") BannerRequestDto bannerRequestDto,
            @RequestPart(value = "file", required = false) MultipartFile imageFile) { // Resim dosyası opsiyonel
        BannerResponseDto updatedBanner = bannerService.updateBanner(bannerId, bannerRequestDto, imageFile);
        return ResponseEntity.ok(updatedBanner);
    }

    // Admin: Banner'ı sil
    @DeleteMapping("/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteBanner(@PathVariable Integer bannerId) {
        bannerService.deleteBanner(bannerId);
        return ResponseEntity.ok("Banner deleted successfully.");
    }
}