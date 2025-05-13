package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.User; // User entity'si ile token üretmek için
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map;
import java.util.function.Function;
import io.jsonwebtoken.Claims;

public interface JwtService {
    String extractUsername(String token);
    <T> T extractClaim(String token, Function<Claims, T> claimsResolver);
    String generateToken(UserDetails userDetails); // Spring UserDetails ile
    String generateToken(User user); // VEYA direkt User entity'si ile
    String generateToken(Map<String, Object> extraClaims, UserDetails userDetails);
    String generateToken(Map<String, Object> extraClaims, User user);
    boolean isTokenValid(String token, UserDetails userDetails);
    boolean isTokenValid(String token, User user);
}