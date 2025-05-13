package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.AddressRequestDto;
import com.ecommerce.backend.dto.response.AddressResponseDto;
import java.util.List;

public interface AddressService {
    AddressResponseDto createAddressForUser(Integer userId, AddressRequestDto addressRequestDto);
    List<AddressResponseDto> getAddressesByUserId(Integer userId);
    AddressResponseDto getAddressByIdAndUserId(Integer addressId, Integer userId);
    AddressResponseDto updateAddressForUser(Integer addressId, Integer userId, AddressRequestDto addressRequestDto);
    void deleteAddressForUser(Integer addressId, Integer userId);
}