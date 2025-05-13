package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequestDto {

    @NotBlank(message = "Address line cannot be blank")
    @Size(max = 500)
    private String addressLine;

    @NotBlank(message = "City cannot be blank")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "District cannot be blank")
    @Size(max = 100)
    private String district;

    @NotBlank(message = "Postal code cannot be blank")
    @Size(max = 20)
    private String postalCode;

    @NotBlank(message = "Country cannot be blank")
    @Size(max = 100)
    private String country;
}