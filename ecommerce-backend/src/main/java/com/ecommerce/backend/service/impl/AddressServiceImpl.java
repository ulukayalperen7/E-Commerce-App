package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.request.AddressRequestDto;
import com.ecommerce.backend.dto.response.AddressResponseDto;
import com.ecommerce.backend.entity.Address;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.ForbiddenException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.AddressRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public AddressResponseDto createAddressForUser(Integer userId, AddressRequestDto addressRequestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Address address = modelMapper.map(addressRequestDto, Address.class);
        address.setUser(user); // Adresi kullanıcıya bağla
        address.setAddressId(null); // Yeni kayıt olduğu için ID null

        Address savedAddress = addressRepository.save(address);
        return modelMapper.map(savedAddress, AddressResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDto> getAddressesByUserId(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        List<Address> addresses = addressRepository.findByUser_UserId(userId);
        return addresses.stream()
                .map(address -> modelMapper.map(address, AddressResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDto getAddressByIdAndUserId(Integer addressId, Integer userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        // Adresin istenen kullanıcıya ait olup olmadığını kontrol et
        if (!address.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to access this address.");
        }
        return modelMapper.map(address, AddressResponseDto.class);
    }

    @Override
    @Transactional
    public AddressResponseDto updateAddressForUser(Integer addressId, Integer userId, AddressRequestDto addressRequestDto) {
        Address existingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!existingAddress.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to update this address.");
        }

        // DTO'dan gelen verilerle entity'yi güncelle
        existingAddress.setAddressLine(addressRequestDto.getAddressLine());
        existingAddress.setCity(addressRequestDto.getCity());
        existingAddress.setDistrict(addressRequestDto.getDistrict());
        existingAddress.setPostalCode(addressRequestDto.getPostalCode());
        existingAddress.setCountry(addressRequestDto.getCountry());
        // user alanı değişmez

        Address updatedAddress = addressRepository.save(existingAddress);
        return modelMapper.map(updatedAddress, AddressResponseDto.class);
    }

    @Override
    @Transactional
    public void deleteAddressForUser(Integer addressId, Integer userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to delete this address.");
        }
        // Siparişlerde bu adres kullanılıyorsa (ON DELETE RESTRICT), silme işlemi hata verecektir.
        // Bu durum ele alınmalı (örn: adresi pasife çekmek veya kullanıcıya bilgi vermek).
        // Şimdilik DB kısıtlamasına güveniyoruz.
        addressRepository.delete(address);
    }
}