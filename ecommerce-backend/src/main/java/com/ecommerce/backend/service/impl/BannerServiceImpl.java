package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.BannerRequestDto;
import com.ecommerce.backend.dto.response.BannerResponseDto;
import com.ecommerce.backend.entity.Banner;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.BannerRepository;
import com.ecommerce.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private static final Logger logger = LoggerFactory.getLogger(BannerServiceImpl.class);

    private final BannerRepository bannerRepository;
    private final ModelMapper modelMapper;

    @Value("${file.upload-dir}") // application.properties'ten gelen dosya yolu (genel resimler için)
    private String uploadDir;

    private Path bannerUploadLocation; // init metodunda set edilecek

    @jakarta.annotation.PostConstruct
    public void init() {
        this.bannerUploadLocation = Paths.get(uploadDir + "/banners"); // Alt klasör olarak bannerlar
        try {
            Files.createDirectories(bannerUploadLocation);
            logger.info("Created banner image upload directory: {}", bannerUploadLocation.toAbsolutePath());
        } catch (IOException e) {
            logger.error("Could not initialize storage location for banner images", e);
            throw new RuntimeException("Could not initialize storage location for banner images", e);
        }
    }

    @Override
    @Transactional
    public BannerResponseDto createBanner(BannerRequestDto bannerRequestDto, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestException("Banner image file cannot be empty.");
        }

        String imageUrl = storeFile(imageFile); // Dosyayı kaydet

        Banner banner = modelMapper.map(bannerRequestDto, Banner.class);
        banner.setImageUrl(imageUrl);
        banner.setBannerId(null); // Yeni kayıt

        Banner savedBanner = bannerRepository.save(banner);
        return modelMapper.map(savedBanner, BannerResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponseDto getBannerById(Integer bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + bannerId));
        return modelMapper.map(banner, BannerResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponseDto> getAllActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(banner -> modelMapper.map(banner, BannerResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponseDto> getAllBannersForAdmin() {
        return bannerRepository.findAll().stream()
                .map(banner -> modelMapper.map(banner, BannerResponseDto.class))
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public BannerResponseDto updateBanner(Integer bannerId, BannerRequestDto bannerRequestDto, MultipartFile imageFile) {
        Banner existingBanner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + bannerId));

        // Yeni resim yüklenmişse eskiyi sil ve yeniyi kaydet
        if (imageFile != null && !imageFile.isEmpty()) {
            deleteFileByRelativePath(existingBanner.getImageUrl()); // Eski resmi sil
            String newImageUrl = storeFile(imageFile); // Yeni resmi kaydet
            existingBanner.setImageUrl(newImageUrl);
        } else if (StringUtils.hasText(bannerRequestDto.getImageUrl())) {
             // Eğer direkt URL geliyorsa ve değişmişse
            if (!Objects.equals(existingBanner.getImageUrl(), bannerRequestDto.getImageUrl())) {
                deleteFileByRelativePath(existingBanner.getImageUrl()); // Eski resmi sil
                existingBanner.setImageUrl(bannerRequestDto.getImageUrl());
            }
        }

        existingBanner.setTitle(bannerRequestDto.getTitle());
        existingBanner.setLinkUrl(bannerRequestDto.getLinkUrl());
        existingBanner.setIsActive(bannerRequestDto.getIsActive() != null ? bannerRequestDto.getIsActive() : existingBanner.getIsActive());
        existingBanner.setDisplayOrder(bannerRequestDto.getDisplayOrder() != null ? bannerRequestDto.getDisplayOrder() : existingBanner.getDisplayOrder());

        Banner updatedBanner = bannerRepository.save(existingBanner);
        return modelMapper.map(updatedBanner, BannerResponseDto.class);
    }

    @Override
    @Transactional
    public void deleteBanner(Integer bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found with id: " + bannerId));
        deleteFileByRelativePath(banner.getImageUrl()); // Resmi yerelden sil
        bannerRepository.delete(banner);
    }

    // --- Helper Metotlar (ProductServiceImpl'deki gibi) ---
    private String storeFile(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String newFilename = "banner_" + UUID.randomUUID().toString() + (StringUtils.hasText(extension) ? "." + extension : "");

        try {
            if (file.isEmpty()) {
                throw new BadRequestException("Failed to store empty file.");
            }
            if (newFilename.contains("..")) {
                throw new BadRequestException("Cannot store file with relative path outside current directory " + newFilename);
            }
            Path targetLocation = this.bannerUploadLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored banner file: {}", targetLocation.toString());
            // MvcConfig'deki `/product-images/` handler'ına uygun bir path dönmeliyiz.
            // Eğer banner için ayrı bir handler yoksa, `/product-images/banners/` gibi bir path kullanabiliriz.
            // Veya ayrı bir handler tanımlanmalı.
            return "/product-images/banners/" + newFilename; // MvcConfig'e göre erişilebilir URL
        } catch (IOException ex) {
            logger.error("Failed to store banner file {}. Error: {}", newFilename, ex.getMessage(), ex);
            throw new RuntimeException("Failed to store banner file " + newFilename + ". Please try again!", ex);
        }
    }

    private void deleteFileByRelativePath(String relativeImageUrl) {
        if (!StringUtils.hasText(relativeImageUrl)) {
            return;
        }
        try {
            String fileName = relativeImageUrl.substring(relativeImageUrl.lastIndexOf("/") + 1);
            Path filePath = this.bannerUploadLocation.resolve(fileName);
            Files.deleteIfExists(filePath);
            logger.info("Deleted banner file: {}", filePath);
        } catch (IOException e) {
            logger.error("Could not delete banner file: {}. Error: {}", relativeImageUrl, e.getMessage());
        }
    }
}