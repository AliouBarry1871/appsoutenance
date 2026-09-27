package com.example.starter.dto;

import com.example.starter.domain.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AdminAgencyResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String companyName;
    private String ninea;
    private String rccm;
    private String address;
    private boolean verified;
    private boolean enabled;
    private String kycDocumentUrl;
    private String profilePictureUrl;
    private SubscriptionStatus subscriptionStatus;
}