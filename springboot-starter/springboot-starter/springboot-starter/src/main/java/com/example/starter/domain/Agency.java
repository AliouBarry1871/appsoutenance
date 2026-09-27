package com.example.starter.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "agencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agency extends User {

    private String companyName;
    private String ninea;
    private String rccm;
    private String address;

    @Column(nullable = false)
    private boolean verified = false;

    private String profilePictureUrl; // Photo de profil de l'agent ou logo d'agence
    private String kycDocumentUrl;    // Passeport ou CNI pour validation administrative

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.INACTIVE;
}