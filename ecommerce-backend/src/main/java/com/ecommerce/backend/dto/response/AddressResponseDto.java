package com.ecommerce.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AddressResponseDto {
    private Integer addressId;
    private String addressLine;
    private String city;
    private String district;
    private String postalCode;
    private String country;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}