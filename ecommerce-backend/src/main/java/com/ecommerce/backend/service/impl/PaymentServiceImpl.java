package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.response.PaymentIntentResponseDto;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.Payment;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.PaymentRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository; // Opsiyonel, Stripe customer için
    private final OrderService orderService; // Sipariş durumunu güncellemek için

    @Value("${stripe.api.key.secret}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Override
    @Transactional
    public PaymentIntentResponseDto createPaymentIntent(Integer orderId, Integer userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("Order does not belong to the authenticated user.");
        }

        if (!"pending_payment".equalsIgnoreCase(order.getStatus())) {
            throw new BadRequestException("Order is not in a state suitable for payment. Current status: " + order.getStatus());
        }

        // Eğer daha önce bu sipariş için bir payment intent oluşturulmuşsa onu kullan (opsiyonel)
        Payment existingPaymentRecord = paymentRepository.findByOrder(order).orElse(null);
        if (existingPaymentRecord != null && existingPaymentRecord.getStripePaymentIntentId() != null) {
            try {
                PaymentIntent existingPi = PaymentIntent.retrieve(existingPaymentRecord.getStripePaymentIntentId());
                // Eğer PI hala ödenebilir durumdaysa client_secret'ını dön
                if ("requires_payment_method".equals(existingPi.getStatus()) || "requires_action".equals(existingPi.getStatus())) {
                    logger.info("Existing PaymentIntent {} found for order {}. Returning its client_secret.", existingPi.getId(), orderId);
                    return new PaymentIntentResponseDto(existingPi.getClientSecret(), existingPi.getId(), order.getStatus());
                }
                // Eğer ödenmiş veya iptal edilmişse yeni bir tane oluşturmak gerekebilir.
                // Bu senaryo daha detaylı ele alınmalı. Şimdilik basit tutuyoruz.
            } catch (StripeException e) {
                logger.warn("Could not retrieve existing PaymentIntent {}: {}", existingPaymentRecord.getStripePaymentIntentId(), e.getMessage());
                // Hata durumunda yeni bir PI oluşturmaya devam et
            }
        }


        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(order.getTotalAmount().multiply(new BigDecimal("100")).longValue()) // Kuruş cinsinden
                .setCurrency(order.getPayment() != null ? order.getPayment().getCurrency().toLowerCase() : "try") // Varsayılan para birimi
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .putMetadata("order_id", order.getOrderId().toString())
                .putMetadata("user_id", order.getUser().getUserId().toString())
                // Stripe Customer ID'si varsa ödeme yöntemlerini kaydetmek/kullanmak için
                .setCustomer(order.getUser().getStripeCustomerId()) // Users entity'sinde stripe_customer_id olmalı
                .build();

        try {
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            logger.info("Stripe PaymentIntent created: {} for order ID: {}", paymentIntent.getId(), order.getOrderId());

            // Ödeme kaydını veritabanına (veya güncelle)
            Payment payment = paymentRepository.findByOrder(order).orElse(new Payment());
            payment.setOrder(order);
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setAmount(order.getTotalAmount());
            payment.setCurrency(params.getCurrency().toUpperCase()); // Veya order'dan al
            payment.setStatus(paymentIntent.getStatus()); // Örn: "requires_payment_method"
            paymentRepository.save(payment);

            return new PaymentIntentResponseDto(paymentIntent.getClientSecret(), paymentIntent.getId(), order.getStatus());
        } catch (StripeException e) {
            logger.error("Error creating Stripe PaymentIntent for order ID: {}: {}", order.getOrderId(), e.getMessage(), e);
            throw new RuntimeException("Could not create payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void handleStripeWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            logger.error("Webhook error: Invalid signature. {}", e.getMessage());
            throw new BadRequestException("Invalid Stripe webhook signature.");
        } catch (Exception e) {
            logger.error("Webhook error: Could not construct event. {}", e.getMessage());
            throw new BadRequestException("Invalid webhook payload.");
        }

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        
        // <<< DEĞİŞİKLİK BURADA BAŞLIYOR >>>
        final com.stripe.model.PaymentIntent stripePaymentIntent; // Değişkeni final yapıyoruz

        if (dataObjectDeserializer.getObject().isPresent() && dataObjectDeserializer.getObject().get() instanceof com.stripe.model.PaymentIntent) {
            stripePaymentIntent = (com.stripe.model.PaymentIntent) dataObjectDeserializer.getObject().get();
        } else {
            logger.warn("Received Stripe event type {} which is not a PaymentIntent or data object is not present.", event.getType());
            return;
        }
        // <<< DEĞİŞİKLİK BURADA BİTİYOR >>>

        logger.info("Received Stripe Webhook event: Type: {}, PaymentIntent ID: {}", event.getType(), stripePaymentIntent.getId());

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntent.getId())
                .orElseThrow(() -> {
                    logger.error("Payment record not found for Stripe PaymentIntent ID: {}", stripePaymentIntent.getId());
                    return new ResourceNotFoundException("Payment record not found for PI: " + stripePaymentIntent.getId());
                });

        payment.setStatus(stripePaymentIntent.getStatus());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order == null) {
            logger.error("Order not found for payment ID: {}", payment.getPaymentId());
            return; 
        }

        switch (event.getType()) {
            case "payment_intent.succeeded":
                logger.info("PaymentIntent Succeeded for order ID: {}", order.getOrderId());
                if (!"processing".equalsIgnoreCase(order.getStatus()) && !"shipped".equalsIgnoreCase(order.getStatus()) && !"delivered".equalsIgnoreCase(order.getStatus())) {
                    orderService.updateOrderStatus(order.getOrderId(), "processing");
                    logger.info("Order ID: {} status set to processing, stock updated, cart cleared.", order.getOrderId());
                } else {
                     logger.info("Order ID: {} was already processed or further along. Status: {}. No action taken on status.", order.getOrderId(), order.getStatus());
                }
                break;
            case "payment_intent.processing":
                 logger.info("PaymentIntent Processing for order ID: {}", order.getOrderId());
                 if (!"processing".equalsIgnoreCase(order.getStatus())) {
                     orderService.updateOrderStatus(order.getOrderId(), "payment_processing");
                 }
                break;
            case "payment_intent.payment_failed":
                logger.warn("PaymentIntent Failed for order ID: {}. Reason: {}", order.getOrderId(), stripePaymentIntent.getLastPaymentError() != null ? stripePaymentIntent.getLastPaymentError().getMessage() : "N/A");
                orderService.updateOrderStatus(order.getOrderId(), "payment_failed");
                break;
            case "payment_intent.canceled":
                 logger.info("PaymentIntent Canceled for order ID: {}", order.getOrderId());
                 orderService.updateOrderStatus(order.getOrderId(), "cancelled");
                break;
            default:
                logger.warn("Unhandled Stripe event type: {}", event.getType());
        }
    }
}