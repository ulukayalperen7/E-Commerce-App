package com.ecommerce.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponseDto user; // Kullanıcı bilgilerini de dönebiliriz

    public AuthResponseDto(String accessToken, UserResponseDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }
}