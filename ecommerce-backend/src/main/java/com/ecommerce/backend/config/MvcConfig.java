package com.ecommerce.backend.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absoluteUploadPath = Paths.get(uploadDir).toFile().getAbsolutePath();
        
        // Ürün resimleri için
        registry.addResourceHandler("/product-images/**")
                .addResourceLocations("file:" + absoluteUploadPath + "/");

        // <<< YENİ EKLENEN KISIM: Banner resimleri için (alt klasör) >>>
        registry.addResourceHandler("/product-images/banners/**")
                .addResourceLocations("file:" + Paths.get(absoluteUploadPath, "banners").toFile().getAbsolutePath() + "/");
    }
}