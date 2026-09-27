package com.example.starter.dto;

import com.example.starter.domain.Role;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private Role role;

    // Champs spécifiques à l'agence
    private String companyName;
    private String ninea;
    private String rccm;
    private String address;

    // Fichiers téléchargés depuis le formulaire Angular
    private MultipartFile profilePicture;
    private MultipartFile kycDocument;
}