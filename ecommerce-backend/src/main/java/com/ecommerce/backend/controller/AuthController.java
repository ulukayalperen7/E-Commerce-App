package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.LoginRequestDto;
import com.ecommerce.backend.dto.request.RegisterRequestDto;
import com.ecommerce.backend.dto.response.AuthResponseDto;
import com.ecommerce.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> registerUser(@Valid @RequestBody RegisterRequestDto registerRequestDto) {
        AuthResponseDto authResponse = authService.registerUser(registerRequestDto);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> loginUser(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        AuthResponseDto authResponse = authService.loginUser(loginRequestDto);
        return ResponseEntity.ok(authResponse);
    }

    // TODO: Refresh token endpoint'i eklenebilir
    // @PostMapping("/refresh-token")
    // public ResponseEntity<?> refreshToken() { ... }
}