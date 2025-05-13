package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.response.PaymentIntentResponseDto;
import com.ecommerce.backend.service.PaymentService;
import com.ecommerce.backend.service.UserService; // User ID almak için
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final UserService userService;

    // Helper metot: Authentication'dan kullanıcı ID'sini alır
    private Integer getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("User must be authenticated for this operation.");
        }
        return userService.getCurrentAuthenticatedUser().getUserId();
    }

    // Frontend'den gelen orderId ile Stripe Payment Intent oluşturur
    // Bu endpoint, kullanıcı ödeme sayfasına geçtiğinde çağrılır.
    @PostMapping("/create-payment-intent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentIntentResponseDto> createPaymentIntent(
            @RequestParam Integer orderId,
            Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        PaymentIntentResponseDto paymentIntentResponse = paymentService.createPaymentIntent(orderId, userId);
        return ResponseEntity.ok(paymentIntentResponse);
    }


    // Stripe Webhook Endpoint'i
    // BU ENDPOINT PUBLIC OLMALI VE CSRF KORUMASINDAN MUAF OLMALIDIR.
    // SecurityConfig'de "/api/v1/stripe/webhook" path'i permitAll() yapılmıştı.
    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload, // Stripe'dan gelen ham JSON payload
            @RequestHeader("Stripe-Signature") String sigHeader) { // Stripe'ın gönderdiği imza
        logger.info("Received Stripe Webhook. Signature: {}", sigHeader);
        try {
            paymentService.handleStripeWebhookEvent(payload, sigHeader);
            return ResponseEntity.ok("Webhook received successfully.");
        } catch (Exception e) {
            // Hata durumunda Stripe'a 400 Bad Request dönmek, tekrar denemesini engelleyebilir (duruma göre).
            // Ya da 200 OK dönüp hatayı loglamak ve manuel müdahale etmek gerekebilir.
            // SignatureVerificationException için 400 dönmek mantıklı.
            logger.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook processing error: " + e.getMessage());
        }
    }
}