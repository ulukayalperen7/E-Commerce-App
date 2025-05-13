package com.ecommerce.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Null alanları JSON yanıtına dahil etme
public class ErrorResponseDto {
    private LocalDateTime timestamp;
    private int status;
    private String error; // HttpStatus adı (örn: "Not Found", "Bad Request")
    private String message; // Detaylı hata mesajı
    private String path;    // Hatanın oluştuğu URL
    private Map<String, String> validationErrors; // Bean validation hataları için
    private String stackTrace; // Opsiyonel, sadece geliştirme için

    public ErrorResponseDto(LocalDateTime timestamp, int status, String error, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public ErrorResponseDto(LocalDateTime timestamp, int status, String error, String message, String path, Map<String, String> validationErrors) {
        this(timestamp, status, error, message, path);
        this.validationErrors = validationErrors;
    }

    public ErrorResponseDto(LocalDateTime timestamp, int status, String error, String message, String path, String stackTrace) {
        this(timestamp, status, error, message, path);
        this.stackTrace = stackTrace;
    }
     public ErrorResponseDto(LocalDateTime timestamp, int status, String error, String message, String path, Map<String, String> validationErrors, String stackTrace) {
        this(timestamp, status, error, message, path, validationErrors);
        this.stackTrace = stackTrace;
    }
}