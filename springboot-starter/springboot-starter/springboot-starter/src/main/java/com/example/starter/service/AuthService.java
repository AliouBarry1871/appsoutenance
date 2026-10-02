package com.example.starter.service;

import com.example.starter.config.JwtUtils;
import com.example.starter.domain.*;
import com.example.starter.dto.AuthRequest;
import com.example.starter.dto.AuthResponse;
import com.example.starter.dto.RegisterRequest;
import com.example.starter.exception.EmailAlreadyExistsException;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final FileStorageService fileStorageService; // Service de stockage des fichiers
    private final EmailService emailService; // Service d'envoi d'email de bienvenue

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Cet email est déjà utilisé");
        }

        User user;
        if (Role.ROLE_AGENCY.equals(request.getRole())) {
            // Validation stricte des fichiers requis pour l'agence
            if (request.getProfilePicture() == null || request.getProfilePicture().isEmpty()) {
                throw new IllegalArgumentException("La photo de profil ou le logo de l'agence est obligatoire.");
            }
            if (request.getKycDocument() == null || request.getKycDocument().isEmpty()) {
                throw new IllegalArgumentException("La pièce d'identité (CNI ou Passeport) est obligatoire.");
            }

            // Enregistrement des fichiers et récupération de leurs URLs publiques
            String profilePictureUrl = fileStorageService.storeFile(request.getProfilePicture());
            String kycDocumentUrl = fileStorageService.storeFile(request.getKycDocument());

            Agency agency = new Agency();
            agency.setEmail(request.getEmail());
            agency.setPassword(passwordEncoder.encode(request.getPassword()));
            agency.setFullName(request.getFullName());
            agency.setPhone(request.getPhone());
            agency.setRole(Role.ROLE_AGENCY);
            agency.setCompanyName(request.getCompanyName());
            agency.setNinea(request.getNinea());
            agency.setRccm(request.getRccm());
            agency.setAddress(request.getAddress());
            agency.setProfilePictureUrl(profilePictureUrl);
            agency.setKycDocumentUrl(kycDocumentUrl);
            agency.setVerified(false); // Validation manuelle requise par un ADMIN
            agency.setSubscriptionStatus(SubscriptionStatus.INACTIVE);
            agency.setEnabled(true);
            user = agency;
        } else {
            // Création d'un client standard
            user = User.builder()
                    .email(request.getEmail().trim().toLowerCase())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName())
                    .phone(request.getPhone())
                    .role(Role.ROLE_CLIENT)
                    .enabled(true)
                    .build();
        }

        userRepository.save(user);

        // Envoi automatique de l'email de bienvenue et remerciement
        emailService.sendWelcomeEmail(user);

        String jwtToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> {
                    if (email.equals("adama@email.com")) {
                        return userRepository.findByEmailIgnoreCase("adama@gmail.com");
                    } else if (email.equals("adama@gmail.com")) {
                        return userRepository.findByEmailIgnoreCase("adama@email.com");
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'adresse : " + request.getEmail()));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        // Envoi automatique et immédiat de l'email de bienvenue/connexion (< 10 secondes) et notification in-app
        emailService.sendLoginEmail(user);

        String jwtToken = jwtUtils.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }
}