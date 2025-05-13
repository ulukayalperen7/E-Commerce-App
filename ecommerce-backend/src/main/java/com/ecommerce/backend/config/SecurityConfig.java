package com.ecommerce.backend.config;

import com.ecommerce.backend.service.JwtService; // JWT servisimiz
import com.ecommerce.backend.service.UserService; // Spring UserDetailsService implementasyonu için
import com.ecommerce.backend.filter.JwtAuthFilter; // Import the JwtAuthFilter class
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // CSRF disable için
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler; // Logout için
import org.springframework.web.cors.CorsConfiguration; // CORS için
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity // Spring Security'yi etkinleştirir
@EnableMethodSecurity // @PreAuthorize gibi metot seviyesi güvenlik anotasyonlarını etkinleştirir
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter; // Bu filter'ı birazdan oluşturacağız
    private final UserService userService; // UserDetailsService implementasyonu için
    // private final LogoutHandler logoutHandler; // Eğer özel bir logout handler'ınız varsa

    // API path'leri için sabitler (opsiyonel ama okunurluğu artırır)
    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/v1/categories/**",
            "/api/v1/brands/**",
            "/api/v1/products/**", // Detay ve listeleme public olabilir
            "/product-images/**"   // Resimlere erişim
    };

    private static final String[] PUBLIC_POST_ENDPOINTS = {
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/stripe/webhook" // Stripe webhook endpoint'i public olmalı ve CSRF'siz
    };


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // REST API için CSRF genellikle devre dışı bırakılır (JWT kullanıyoruz)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS ayarları
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(PUBLIC_POST_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        // Swagger/OpenAPI endpoint'leri (eğer kullanıyorsanız)
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Diğer tüm istekler kimlik doğrulama gerektirir
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Session kullanmıyoruz, her istek JWT ile doğrulanacak
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Kendi JWT filter'ımızı ekliyoruz
                // .logout(logout -> logout // Eğer logout endpoint'i eklemek isterseniz
                //         .logoutUrl("/api/v1/auth/logout")
                //         .addLogoutHandler(logoutHandler) // Özel logout handler
                //         .logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext())
                // );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService.userDetailsService()); // UserService'de bu metodu oluşturacağız
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsFilter corsFilter() { // CorsConfigurationSource'u kullanmak daha modern
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:3000")); // Frontend adres(ler)iniz
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*")); // Veya spesifik header'lar: "Authorization", "Content-Type", "X-Requested-With"
        configuration.setAllowCredentials(true); // Cookie veya Authorization header'ı ile istekler için
        configuration.setMaxAge(3600L); // Pre-flight isteklerinin cache süresi

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration); // Sadece /api altındaki path'ler için
        return source;
    }
}