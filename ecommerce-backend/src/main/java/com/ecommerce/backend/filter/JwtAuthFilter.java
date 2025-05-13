package com.ecommerce.backend.filter; // veya com.ecommerce.backend.filter

import com.ecommerce.backend.service.JwtService;
import com.ecommerce.backend.service.UserService; // UserDetailsService'i almak için
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils; // StringUtils.isEmpty ve startsWith için
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Spring tarafından yönetilmesi için @Component anotasyonu
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserService userService; // UserDetailsService implementasyonunu UserService üzerinden alacağız

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Authorization header'ı yoksa veya "Bearer " ile başlamıyorsa,
        // bu filtreyi atla ve sonraki filtreye geç.
        if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWithIgnoreCase(authHeader, "Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // "Bearer " prefix'ini (7 karakter) atlayarak token'ı al
        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt); // JWT'den kullanıcı adını (e-posta) çek
        } catch (Exception e) {
            // Token parse edilemezse veya süresi geçmişse vs.
            logger.warn("JWT Token parsing failed or token is invalid: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // İsteğe bağlı: Hatalı token için direkt 401 dönebilirsin
            // response.getWriter().write("Invalid JWT Token");
            // filterChain.doFilter(request, response); // Veya sadece sonraki filtreye devam et, SecurityConfig halleder.
            // Şimdilik SecurityConfig'in halletmesine izin verelim, orası zaten unauthenticated bırakacak.
            filterChain.doFilter(request, response);
            return;
        }


        // Eğer e-posta adresi token'dan çekilebildiyse VE SecurityContext'te henüz bir Authentication nesnesi yoksa
        if (StringUtils.isNotEmpty(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Veritabanından UserDetails nesnesini yükle
            UserDetails userDetails = userService.userDetailsService().loadUserByUsername(userEmail);

            // Token geçerli mi kontrol et
            if (jwtService.isTokenValid(jwt, userDetails)) {
                logger.debug("JWT Token is valid for user: {}", userEmail);
                SecurityContext context = SecurityContextHolder.createEmptyContext();

                // Yeni bir Authentication token oluştur
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credentials (şifre), JWT kullandığımız için null
                        userDetails.getAuthorities() // Kullanıcının rolleri/yetkileri
                );

                // Authentication token'ına istekle ilgili detayları ekle
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContext'e Authentication nesnesini set et
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);
            } else {
                logger.warn("JWT Token is invalid for user: {}", userEmail);
            }
        }
        // İsteği sonraki filtreye veya DispatcherServlet'e ilet
        filterChain.doFilter(request, response);
    }
}