package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @OneToOne(fetch = FetchType.LAZY) // Bir ödeme bir siparişe aittir
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    private Order order;

    @Column(name = "stripe_payment_intent_id", unique = true, nullable = false, length = 255)
    private String stripePaymentIntentId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3, columnDefinition = "VARCHAR(3) DEFAULT 'TRY'")
    private String currency = "TRY";

    @Column(nullable = false, length = 50)
    private String status; // 'succeeded', 'pending', 'failed', 'requires_action' vb. Stripe durumları

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", updatable = false, insertable = false)
    private LocalDateTime updatedAt;
}