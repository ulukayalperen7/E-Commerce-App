package com.ecommerce.backend.dto.response;

import lombok.Data;

@Data
public class UserSummaryResponseDto {
    private Integer userId;
    private String firstName;
    private String lastName;
    // private String profileImageUrl; // Eğer varsa
}