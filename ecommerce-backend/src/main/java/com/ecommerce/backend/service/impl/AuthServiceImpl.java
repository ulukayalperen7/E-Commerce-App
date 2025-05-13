package com.ecommerce.backend.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.dto.request.LoginRequestDto;
import com.ecommerce.backend.dto.request.RegisterRequestDto;
import com.ecommerce.backend.dto.response.AuthResponseDto;
import com.ecommerce.backend.dto.response.UserResponseDto;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UniqueConstraintException;
import com.ecommerce.backend.model.RoleEnum;
import com.ecommerce.backend.repository.RoleRepository;
import com.ecommerce.backend.repository.UserRepository; // Bu UserDetails, Spring'in kendi UserDetails'i
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public AuthResponseDto registerUser(RegisterRequestDto registerRequestDto) {
        if (userRepository.existsByEmail(registerRequestDto.getEmail())) {
            throw new UniqueConstraintException("Email address already in use.");
        }

        User user = new User();
        user.setFirstName(registerRequestDto.getFirstName());
        user.setLastName(registerRequestDto.getLastName());
        user.setEmail(registerRequestDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequestDto.getPassword())); // passwordHash kullanılıyor
        user.setIsActive(true);

        RoleEnum requestedRoleEnum = registerRequestDto.getRole();
        String roleNameForDBLookup;

        if (requestedRoleEnum == RoleEnum.ROLE_SELLER) {
            roleNameForDBLookup = "ROLE_SELLER";
        } else if (requestedRoleEnum == RoleEnum.ROLE_CUSTOMER) {
            roleNameForDBLookup = "ROLE_CUSTOMER";
        } else {
            throw new BadRequestException("Unsupported role specified for registration: " + requestedRoleEnum);
        }
        
        Role userRoleEntity = roleRepository.findByRoleName(roleNameForDBLookup)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found in database: " + roleNameForDBLookup));
        
        user.setRole(userRoleEntity); // Tek bir Role nesnesi set ediliyor

        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(savedUser); 
        UserResponseDto userResponseDto = mapToUserResponseDto(savedUser);

        return new AuthResponseDto(jwtToken, userResponseDto);
    }

    @Override
    public AuthResponseDto loginUser(LoginRequestDto loginRequestDto) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getEmail(),
                            loginRequestDto.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadRequestException("Invalid email or password.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Authentication principal'ından UserDetails'i alıp oradan username (email) ile user'ı çekmek daha güvenli.
        // Eğer User entity'niz UserDetails implement ediyorsa, direkt cast edilebilir.
        // Yoksa, UserDetailsService implementasyonunuz (UserService içinde) UserDetails döner.
        UserDetails springUserDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(springUserDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + springUserDetails.getUsername()));

        String jwtToken = jwtService.generateToken(user);
        UserResponseDto userResponseDto = mapToUserResponseDto(user);
        return new AuthResponseDto(jwtToken, userResponseDto);
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        UserResponseDto dto = modelMapper.map(user, UserResponseDto.class);
        if (user.getRole() != null) {
             dto.setRole(user.getRole().getRoleName()); // Role entity'sinde rol adını tutan alan getRoleName() ise
        }
        return dto;
    }
}