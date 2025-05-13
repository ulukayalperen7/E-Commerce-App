package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.ProductImageRequestDto;
import com.ecommerce.backend.dto.request.ProductRequestDto;
import com.ecommerce.backend.dto.response.ProductImageResponseDto;
import com.ecommerce.backend.dto.response.ProductResponseDto;
import com.ecommerce.backend.dto.response.ProductSummaryResponseDto;
import com.ecommerce.backend.dto.response.UserSummaryResponseDto;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UnauthorizedException;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.service.ProductService;
import com.ecommerce.backend.util.RoleName;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // String yardımcı metotları için
// import org.springframework.web.multipart.MultipartFile; // Eğer dosya yükleme olacaksa
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.backend.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository; // Ortalama puan için
    private final ModelMapper modelMapper;
    // private final Slugify slugify; // Ürün slug'ı da olacaksa

    @Value("${file.upload-dir}")
    private String uploadDir; // application.properties'ten gelen dosya yolu

    private Path rootLocation; // init metodunda set edilecek

    @jakarta.annotation.PostConstruct // Bean oluşturulduktan sonra çalışır
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
            logger.info("Created product image upload directory: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            logger.error("Could not initialize storage location for product images", e);
            throw new RuntimeException("Could not initialize storage location for product images", e);
        }
    }


     private User getCurrentAuthenticatedUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User not authenticated."); // Veya ResourceNotFoundException
        }
        String username = ((UserDetails) authentication.getPrincipal()).getUsername(); // Bu e-posta
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + username));
    }
    public Page<ProductSummaryResponseDto> getProductsByCurrentSeller(Pageable pageable) {
        User currentSeller = getCurrentAuthenticatedUserEntity();
        Page<Product> productsPage = productRepository.findBySellerAndIsActiveTrue(currentSeller, pageable); // Repository'ye eklenmeli
        return productsPage.map(this::mapToProductSummaryResponseDto);
    }

    @Override
    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto productRequestDto) {
        User currentSeller = getCurrentAuthenticatedUserEntity(); // <<< DEĞİŞİKLİK

        // Satıcı rol kontrolü (opsiyonel, @PreAuthorize ile de yapılabilir ama burada da iyi)
        if (!currentSeller.getRole().getRoleName().equals(RoleName.SELLER.name()) &&
            !currentSeller.getRole().getRoleName().equals(RoleName.ADMIN.name())) {
            throw new ForbiddenException("Only SELLER or ADMIN can create products.");
        }

        Category category = categoryRepository.findById(productRequestDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productRequestDto.getCategoryId()));
        Brand brand = brandRepository.findById(productRequestDto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + productRequestDto.getBrandId()));

        Product product = modelMapper.map(productRequestDto, Product.class);
        product.setCategory(category);
        product.setBrand(brand);
        product.setSeller(currentSeller); // <<< Ürünü o anki kullanıcıya (satıcıya) ata
        product.setProductId(null);
        product.setIsActive(productRequestDto.getIsActive() != null ? productRequestDto.getIsActive() : true);

        if (StringUtils.hasText(productRequestDto.getImageUrl())) {
            product.setImageUrl(productRequestDto.getImageUrl());
        }

        Product savedProduct = productRepository.save(product);

        if (productRequestDto.getAdditionalImages() != null && !productRequestDto.getAdditionalImages().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (ProductImageRequestDto imgDto : productRequestDto.getAdditionalImages()) {
                ProductImage productImage = new ProductImage();
                productImage.setProduct(savedProduct);
                productImage.setImageUrl(imgDto.getImageUrl());
                productImage.setAltText(imgDto.getAltText());
                productImage.setDisplayOrder(imgDto.getDisplayOrder());
                images.add(productImageRepository.save(productImage));
            }
            savedProduct.setProductImages(images);
        }
        return mapToProductResponseDto(savedProduct);
    }


    @Override
    public ProductResponseDto getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return mapToProductResponseDto(product);
    }

    @Override
    public Page<ProductSummaryResponseDto> getAllActiveProducts(Pageable pageable) {
        Page<Product> productsPage = productRepository.findByIsActiveTrue(pageable);
        return productsPage.map(this::mapToProductSummaryResponseDto);
    }

    @Override
    public Page<ProductSummaryResponseDto> getActiveProductsByCategory(Integer categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        Page<Product> productsPage = productRepository.findByCategoryAndIsActiveTrue(category, pageable);
        return productsPage.map(this::mapToProductSummaryResponseDto);
    }

    @Override
    public Page<ProductSummaryResponseDto> getActiveProductsByBrand(Integer brandId, Pageable pageable) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
        Page<Product> productsPage = productRepository.findByBrandAndIsActiveTrue(brand, pageable);
        return productsPage.map(this::mapToProductSummaryResponseDto);
    }

    @Override
    public Page<ProductSummaryResponseDto> searchActiveProducts(String searchTerm, Integer categoryId, Integer brandId, Pageable pageable) {
        // Repository'deki özel JPQL sorgusunu kullan
        Page<Product> productsPage = productRepository.searchActiveProducts(
                categoryId,
                brandId,
                StringUtils.hasText(searchTerm) ? searchTerm.toLowerCase() : null,
                pageable
        );
        return productsPage.map(this::mapToProductSummaryResponseDto);
    }

    @Override
    @Transactional
    public ProductResponseDto updateProduct(Integer productId, ProductRequestDto productRequestDto) {
        User currentUser = getCurrentAuthenticatedUserEntity(); // <<< DEĞİŞİKLİK
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Yetkilendirme: Sadece ürünün sahibi olan SELLER veya ADMIN güncelleyebilir
        if (!currentUser.getRole().getRoleName().equals(RoleName.ADMIN.name()) &&
            (existingProduct.getSeller() == null || !existingProduct.getSeller().getUserId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("You do not have permission to update this product.");
        }
        // ... (kalan güncelleme mantığı aynı) ...
        Category category = categoryRepository.findById(productRequestDto.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productRequestDto.getCategoryId()));
        Brand brand = brandRepository.findById(productRequestDto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + productRequestDto.getBrandId()));

        existingProduct.setName(productRequestDto.getName());
        existingProduct.setDescription(productRequestDto.getDescription());
        existingProduct.setPrice(productRequestDto.getPrice());
        existingProduct.setCategory(category);
        existingProduct.setBrand(brand);
        existingProduct.setStockQuantity(productRequestDto.getStockQuantity());
        existingProduct.setIsActive(productRequestDto.getIsActive() != null ? productRequestDto.getIsActive() : existingProduct.getIsActive());

        if (StringUtils.hasText(productRequestDto.getImageUrl()) &&
            !Objects.equals(existingProduct.getImageUrl(), productRequestDto.getImageUrl())) {
            deleteFileByRelativePath(existingProduct.getImageUrl());
            existingProduct.setImageUrl(productRequestDto.getImageUrl());
        }

        if (productRequestDto.getAdditionalImages() != null) {
            existingProduct.getProductImages().forEach(img -> {
                deleteFileByRelativePath(img.getImageUrl());
                productImageRepository.delete(img);
            });
            existingProduct.getProductImages().clear();

            for (ProductImageRequestDto imgDto : productRequestDto.getAdditionalImages()) {
                ProductImage productImage = new ProductImage();
                productImage.setProduct(existingProduct);
                productImage.setImageUrl(imgDto.getImageUrl());
                productImage.setAltText(imgDto.getAltText());
                productImage.setDisplayOrder(imgDto.getDisplayOrder());
                existingProduct.getProductImages().add(productImageRepository.save(productImage));
            }
        }
        Product updatedProduct = productRepository.save(existingProduct);
        return mapToProductResponseDto(updatedProduct);
    }


    @Override
    @Transactional
    public void deleteProduct(Integer productId) {
        User currentUser = getCurrentAuthenticatedUserEntity(); // <<< DEĞİŞİKLİK
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Yetkilendirme: Sadece ürünün sahibi olan SELLER veya ADMIN silebilir
        if (!currentUser.getRole().getRoleName().equals(RoleName.ADMIN.name()) &&
            (product.getSeller() == null || !product.getSeller().getUserId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("You do not have permission to delete this product.");
        }
        // ... (kalan silme mantığı aynı) ...
        if (StringUtils.hasText(product.getImageUrl())) {
            deleteFileByRelativePath(product.getImageUrl());
        }
        product.getProductImages().forEach(img -> deleteFileByRelativePath(img.getImageUrl()));
        productRepository.delete(product);
    }

    // Bu metodun MultipartFile alması ve dosyayı kaydetmesi gerekir.
    // Şimdilik ProductRequestDto'dan URL geldiğini varsayıyoruz.
    // Gerçek dosya yükleme için bu metodun içeriği değişir.
    @Override
    @Transactional
    public ProductResponseDto addImageToProduct(Integer productId, ProductImageRequestDto imageRequestDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // TODO: Eğer imageRequestDto.imageUrl bir MultipartFile ise, dosyayı burada kaydet
        // String fileName = storeFile(imageFile); // storeFile helper metodu
        // String fileDownloadUri = "/product-images/" + fileName; // MvcConfig'e göre

        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setImageUrl(imageRequestDto.getImageUrl()); // Direkt URL varsayımı
        productImage.setAltText(imageRequestDto.getAltText());
        productImage.setDisplayOrder(imageRequestDto.getDisplayOrder());

        productImageRepository.save(productImage);
        product.getProductImages().add(productImage); // Entity'deki listeyi güncellemek için (opsiyonel, DTO'da zaten olacak)

        return mapToProductResponseDto(productRepository.save(product)); // Product'ı tekrar save etmek updatedAt'i tetikleyebilir
    }


    @Override
    @Transactional
    public void removeImageFromProduct(Integer productId, Integer productImageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductImage imageToRemove = productImageRepository.findById(productImageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found with id: " + productImageId));

        if (!imageToRemove.getProduct().getProductId().equals(productId)) {
            throw new BadRequestException("Image does not belong to the specified product.");
        }

        // Yerelden dosyayı sil
        deleteFileByRelativePath(imageToRemove.getImageUrl());

        productImageRepository.delete(imageToRemove);
        // product.getProductImages().remove(imageToRemove); // İlişkiyi entity'den de kaldırmak için
        // productRepository.save(product); // Gerekirse
    }

    // --- Helper Metotlar ---

    private ProductResponseDto mapToProductResponseDto(Product product) {
        ProductResponseDto dto = modelMapper.map(product, ProductResponseDto.class);
        if (product.getCategory() != null) {
            dto.setCategory(modelMapper.map(product.getCategory(), com.ecommerce.backend.dto.response.CategoryResponseDto.class));
        }
        if (product.getBrand() != null) {
            dto.setBrand(modelMapper.map(product.getBrand(), com.ecommerce.backend.dto.response.BrandResponseDto.class));
        }
        if (product.getProductImages() != null) {
            dto.setAdditionalImages(product.getProductImages().stream()
                    .map(img -> modelMapper.map(img, ProductImageResponseDto.class))
                    .collect(Collectors.toList()));
        }
        if (product.getSeller() != null) { // <<< EKLENDİ
            dto.setSeller(modelMapper.map(product.getSeller(), UserSummaryResponseDto.class));
        }
        // Ortalama puan ve yorum sayısı (Bu kısım performansı etkileyebilir, optimize edilebilir)
        List<Review> reviews = reviewRepository.findByProduct_ProductId(product.getProductId(), Pageable.unpaged()).getContent();
        if (reviews != null && !reviews.isEmpty()) {
            dto.setTotalReviews(reviews.size());
            dto.setAverageRating(
                reviews.stream().mapToInt(Review::getRating).average().orElse(0.0)
            );
        } else {
            dto.setTotalReviews(0);
            dto.setAverageRating(0.0);
        }
        return dto;
    }

    private ProductSummaryResponseDto mapToProductSummaryResponseDto(Product product) {
        ProductSummaryResponseDto dto = modelMapper.map(product, ProductSummaryResponseDto.class);
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getBrand() != null) {
            dto.setBrandName(product.getBrand().getName());
        }
        // Ortalama puan
        List<Review> reviews = reviewRepository.findByProduct_ProductId(product.getProductId(), Pageable.unpaged()).getContent();
         if (reviews != null && !reviews.isEmpty()) {
            dto.setAverageRating(
                reviews.stream().mapToInt(Review::getRating).average().orElse(0.0)
            );
        } else {
            dto.setAverageRating(0.0);
        }
        return dto;
    }
    // Yerel dosya depolama için basit helper metotlar
    // Bu metodun MultipartFile alıp kaydetmesi daha doğru olurdu.
    // Şimdilik ProductRequestDto'dan URL geldiği varsayımıyla, dosya adını URL'den çıkarmaya çalışalım.
    private String storeFileFromUrl(String fileUrl, Product product) {
        // Bu çok kaba bir varsayım, gerçekte bu işe yaramaz.
        // Güvenli bir şekilde dosya adı üretilmeli ve dosya indirilip kaydedilmeli.
        // Veya en baştan MultipartFile alınmalı.
        try {
            String fileName = StringUtils.getFilename(fileUrl);
            if (fileName == null) {
                fileName = product.getProductId() + "_" + UUID.randomUUID().toString() + ".jpg"; // Varsayılan
            }
            Path targetLocation = this.rootLocation.resolve(fileName);
            // Burada URL'den dosyayı indirip targetLocation'a kaydetmek gerekir.
            // Şimdilik bu adımı atlıyoruz, çünkü direkt URL geliyor.
            // Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/product-images/" + fileName; // MvcConfig'e göre erişilebilir URL
        } catch (Exception ex) {
            logger.error("Could not store file from URL {}. {}", fileUrl, ex.getMessage());
            throw new RuntimeException("Could not store file from URL " + fileUrl + ". Please try again!", ex);
        }
    }
    

    private void deleteFileByRelativePath(String relativeImageUrl) {
        if (!StringUtils.hasText(relativeImageUrl)) {
            return;
        }
        try {
            // "/product-images/" kısmını çıkarıp dosya adını al
            String fileName = relativeImageUrl.substring(relativeImageUrl.lastIndexOf("/") + 1);
            Path filePath = this.rootLocation.resolve(fileName);
            Files.deleteIfExists(filePath);
            logger.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            logger.error("Could not delete file: {}. Error: {}", relativeImageUrl, e.getMessage());
            // Burada hata fırlatmak yerine sadece loglamak daha iyi olabilir,
            // çünkü dosya silinemese bile DB kaydı silinebilir.
        }
    }
    @Override
    @Transactional
    public ProductResponseDto addImageToProduct(Integer productId, MultipartFile imageFile, String altText, Integer displayOrder) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestException("Image file cannot be empty.");
        }

        // Dosyayı kaydet ve erişilebilir URL'sini al
        String imageUrl = storeFile(imageFile, productId); // Bu bizim helper metodumuzdu

        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setImageUrl(imageUrl); // Kaydedilen dosyanın URL'si
        productImage.setAltText(altText);
        productImage.setDisplayOrder(displayOrder != null ? displayOrder : 0);

        productImageRepository.save(productImage);
        
        // Product entity'sindeki listeyi güncellemek (opsiyonel, DB'den tekrar çekildiğinde zaten gelir)
        // product.getProductImages().add(productImage); // Bu satır JPA tarafından yönetildiği için gereksiz olabilir
        // productRepository.save(product); // Sadece productImageRepository.save yeterli olabilir.
                                         // Eğer product'ın updatedAt'ini güncellemek istiyorsanız product'ı da save edebilirsiniz.

        // Ürünün güncel halini (yeni resimle birlikte) döndür
        // Yeniden product çekmek yerine mevcut product'a yeni image'ı ekleyip maplemek daha performanslı olabilir.
        // Ancak DB'den çekmek her zaman en güncel halini garantiler.
        Product updatedProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found after image add with id: " + productId)); // Bu olmamalı
        return mapToProductResponseDto(updatedProduct);
    }

    // ... (storeFile, deleteFileByRelativePath ve diğer helper metodlar) ...
    // storeFile metodunun var olduğundan ve doğru çalıştığından emin olun:
    private String storeFile(MultipartFile file, Integer productId) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = StringUtils.getFilenameExtension(originalFilename);
        // Dosya adını daha benzersiz hale getirelim (productId + UUID + extension)
        String newFilename = "product_" + productId + "_" + UUID.randomUUID().toString() + (StringUtils.hasText(extension) ? "." + extension : "");

        try {
            if (file.isEmpty()) {
                throw new BadRequestException("Failed to store empty file.");
            }
            // Güvenlik kontrolü: Dosya adında ".." olmamalı
            if (newFilename.contains("..")) {
                throw new BadRequestException("Cannot store file with relative path outside current directory " + newFilename);
            }
            Path targetLocation = this.rootLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored file: {}", targetLocation.toString());
            return "/product-images/" + newFilename; // Erişilebilir URL (MvcConfig'e göre)
        } catch (IOException ex) {
            logger.error("Failed to store file {}. Error: {}", newFilename, ex.getMessage(), ex);
            throw new RuntimeException("Failed to store file " + newFilename + ". Please try again!", ex);
        }
    }

}