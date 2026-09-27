package com.example.starter.dto;

import com.example.starter.domain.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgencyProfileResponse {
    private Long id;
    private String companyName;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String ninea;
    private String rccm;
    private boolean verified;
    private String profilePictureUrl;
    private SubscriptionStatus subscriptionStatus;
    private Double averageRating;
    private int totalReviews;
    private int activePropertiesCount;
}
