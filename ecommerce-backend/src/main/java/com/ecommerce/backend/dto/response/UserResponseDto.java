package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List; // Roller için eğer birden fazla rolü varsa veya tek rol adı

@Data
public class UserResponseDto {
    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role; // Sadece rol adını döndürelim
    // private List<String> roles; // Veya roller listesi
    private Boolean isActive;
    private LocalDateTime createdAt;
    // private String stripeCustomerId; // Gerekirse eklenebilir, genellikle frontend'e direkt dönülmez
}