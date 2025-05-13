package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.BrandRequestDto;
import com.ecommerce.backend.dto.response.BrandResponseDto;
import com.ecommerce.backend.entity.Brand;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UniqueConstraintException;
import com.ecommerce.backend.repository.BrandRepository;
import com.ecommerce.backend.service.BrandService;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ModelMapper modelMapper;
    private final Slugify slugify;

    @Override
    @Transactional
    public BrandResponseDto createBrand(BrandRequestDto brandRequestDto) {
        String slug = slugify.slugify(brandRequestDto.getName());
        if (brandRepository.existsByName(brandRequestDto.getName())) {
            throw new UniqueConstraintException("Brand with name '" + brandRequestDto.getName() + "' already exists.");
        }
        if (brandRepository.existsBySlug(slug)) {
            throw new UniqueConstraintException("Brand with generated slug '" + slug + "' already exists. Try a different name.");
        }

        Brand brand = new Brand();
        brand.setName(brandRequestDto.getName());
        brand.setSlug(slug);

        Brand savedBrand = brandRepository.save(brand);
        return modelMapper.map(savedBrand, BrandResponseDto.class);
    }

    @Override
    public BrandResponseDto getBrandById(Integer brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        return modelMapper.map(brand, BrandResponseDto.class);
    }

    @Override
    public BrandResponseDto getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with slug: " + slug));
        return modelMapper.map(brand, BrandResponseDto.class);
    }

    @Override
    public List<BrandResponseDto> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(brand -> modelMapper.map(brand, BrandResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BrandResponseDto updateBrand(Integer brandId, BrandRequestDto brandRequestDto) {
        Brand existingBrand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));

        if (!existingBrand.getName().equals(brandRequestDto.getName())) {
            String newSlug = slugify.slugify(brandRequestDto.getName());
            brandRepository.findByName(brandRequestDto.getName()).ifPresent(br -> {
                if (!br.getBrandId().equals(brandId)) {
                    throw new UniqueConstraintException("Brand with name '" + brandRequestDto.getName() + "' already exists.");
                }
            });
            brandRepository.findBySlug(newSlug).ifPresent(br -> {
                if (!br.getBrandId().equals(brandId)) {
                    throw new UniqueConstraintException("Brand with generated slug '" + newSlug + "' already exists. Try a different name.");
                }
            });
            existingBrand.setSlug(newSlug);
        }

        existingBrand.setName(brandRequestDto.getName());

        Brand updatedBrand = brandRepository.save(existingBrand);
        return modelMapper.map(updatedBrand, BrandResponseDto.class);
    }

    @Override
    @Transactional
    public void deleteBrand(Integer brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        // ON DELETE RESTRICT nedeniyle, markaya bağlı ürünler varsa silinemez.
        if (!brand.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete brand. It has associated products.");
        }
        brandRepository.delete(brand);
    }
}