package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.AddressRequestDto;
import com.ecommerce.backend.dto.response.AddressResponseDto;
import com.ecommerce.backend.service.AddressService; // Bu servisi oluşturacağız
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@PreAuthorize("isAuthenticated()") // Tüm adres işlemleri için kimlik doğrulama gerekli
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService; // Bu servisi oluşturacağız
    private final UserService userService;

    private Integer getCurrentUserId(Authentication authentication) {
        return userService.getCurrentAuthenticatedUser().getUserId();
    }

    @PostMapping
    public ResponseEntity<AddressResponseDto> createAddress(
            @Valid @RequestBody AddressRequestDto addressRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        AddressResponseDto createdAddress = addressService.createAddressForUser(userId, addressRequestDto);
        return new ResponseEntity<>(createdAddress, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AddressResponseDto>> getMyAddresses(Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        List<AddressResponseDto> addresses = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponseDto> getAddressById(
            @PathVariable Integer addressId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        AddressResponseDto address = addressService.getAddressByIdAndUserId(addressId, userId);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponseDto> updateAddress(
            @PathVariable Integer addressId,
            @Valid @RequestBody AddressRequestDto addressRequestDto,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        AddressResponseDto updatedAddress = addressService.updateAddressForUser(addressId, userId, addressRequestDto);
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Integer addressId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        addressService.deleteAddressForUser(addressId, userId);
        return ResponseEntity.ok("Address deleted successfully.");
    }
}