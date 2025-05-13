package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.LoginRequestDto;
import com.ecommerce.backend.dto.request.RegisterRequestDto;
import com.ecommerce.backend.dto.response.AuthResponseDto;

public interface AuthService {
    AuthResponseDto registerUser(RegisterRequestDto registerRequestDto);
    AuthResponseDto loginUser(LoginRequestDto loginRequestDto);
    // Belki refresh token gibi metodlar da eklenebilir
}