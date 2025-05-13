package com.ecommerce.backend.service;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.ecommerce.backend.dto.response.UserResponseDto;
import com.ecommerce.backend.entity.User;

// İleride admin paneli için kullanıcı listeleme, güncelleme, silme gibi metodlar eklenebilir.
// Şimdilik temel olarak UserDetailsService ve mevcut kullanıcıyı getirme metodunu ekleyelim.

public interface UserService {
    /**
     * Spring Security'nin kimlik doğrulama için kullanacağı UserDetailsService implementasyonunu sağlar.
     * Kullanıcıyı e-posta adresine göre yükler.
     */
    UserDetailsService userDetailsService();

    /**
     * Verilen ID'ye sahip kullanıcıyı getirir.
     * @param userId Kullanıcı ID'si
     * @return UserResponseDto Kullanıcı bilgileri
     * @throws com.ecommerce.backend.exception.ResourceNotFoundException Kullanıcı bulunamazsa
     */
    UserResponseDto getUserById(Integer userId);

    /**
     * Kimliği doğrulanmış (authenticated) olan mevcut kullanıcıyı getirir.
     * Bu metot, SecurityContextHolder üzerinden mevcut kullanıcıyı alır.
     * @return UserResponseDto Mevcut kullanıcının bilgileri
     * @throws com.ecommerce.backend.exception.ResourceNotFoundException Kullanıcı bulunamazsa veya kimlik doğrulanmamışsa
     */
    UserResponseDto getCurrentAuthenticatedUser();

    // Admin Kullanıcı Yönetimi için Örnek Metotlar (Gerekirse eklenebilir)
    // List<UserResponseDto> getAllUsers(Pageable pageable);
    // UserResponseDto updateUser(Integer userId, UpdateUserRequestDto updateUserRequestDto);
    // void deleteUser(Integer userId);
    // UserResponseDto assignRoleToUser(Integer userId, String roleName);
    User findUserByEmail(String email);
}