package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.response.PaymentIntentResponseDto;
import com.stripe.model.Event; // Stripe Event
import com.stripe.model.PaymentIntent;

public interface PaymentService {
    PaymentIntentResponseDto createPaymentIntent(Integer orderId, Integer userId);
    void handleStripeWebhookEvent(String payload, String sigHeader); // Stripe'dan gelen webhook'u işler
    // PaymentIntent confirmPaymentIntent(String paymentIntentId); // Gerekirse, frontend sonucuyla manuel onay
}