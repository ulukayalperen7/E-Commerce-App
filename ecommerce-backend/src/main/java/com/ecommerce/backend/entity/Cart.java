package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Integer cartId;

    @OneToOne(fetch = FetchType.LAZY) // Bir kullanıcıya ait tek bir aktif sepet olabilir
    @JoinColumn(name = "user_id", unique = true) // unique = true çünkü her kullanıcının tek sepeti var
    private User user;

    @Column(name = "session_id", unique = true, length = 255) // Misafir kullanıcılar için
    private String sessionId;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", updatable = false, insertable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    // Sepet öğeleri genellikle sepetle birlikte yüklenir (EAGER)
    // Ancak çok fazla ürün olabilecekse LAZY daha iyi olabilir.
    private List<CartItem> cartItems = new ArrayList<>();

    // Sepet toplamını hesaplamak için yardımcı metot (Entity içinde veya Servis katmanında olabilir)
    // @Transient // Bu alan veritabanına kaydedilmez
    // public BigDecimal getTotalAmount() {
    //     return cartItems.stream()
    //             .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
    //             .reduce(BigDecimal.ZERO, BigDecimal::add);
    // }
}