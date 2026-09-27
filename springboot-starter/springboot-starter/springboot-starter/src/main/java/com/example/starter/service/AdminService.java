package com.example.starter.service;

import com.example.starter.domain.Agency;
import com.example.starter.domain.Property;
import com.example.starter.domain.SubscriptionStatus;
import com.example.starter.dto.AdminAgencyResponse;
import com.example.starter.repository.AgencyRepository;
import com.example.starter.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AgencyRepository agencyRepository;
    private final PropertyRepository propertyRepository;

    public List<AdminAgencyResponse> getAllAgencies() {
        return agencyRepository.findAll().stream()
                .map(this::mapToAgencyResponse)
                .collect(Collectors.toList());
    }

    public AdminAgencyResponse verifyAgency(Long agencyId, boolean status) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agence introuvable avec l'ID : " + agencyId));
        agency.setVerified(status);
        Agency updatedAgency = agencyRepository.save(agency);
        return mapToAgencyResponse(updatedAgency);
    }

    public AdminAgencyResponse toggleAgencyStatus(Long agencyId, boolean enabled) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agence introuvable avec l'ID : " + agencyId));
        agency.setEnabled(enabled);
        Agency updatedAgency = agencyRepository.save(agency);
        return mapToAgencyResponse(updatedAgency);
    }

    public AdminAgencyResponse updateSubscriptionStatusManually(Long agencyId, SubscriptionStatus status) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agence introuvable avec l'ID : " + agencyId));
        agency.setSubscriptionStatus(status);
        Agency updatedAgency = agencyRepository.save(agency);
        return mapToAgencyResponse(updatedAgency);
    }

    private final com.example.starter.repository.ReviewRepository reviewRepository;
    private final com.example.starter.repository.ReportRepository reportRepository;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteFraudulentProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable avec l'ID : " + propertyId));
        reportRepository.deleteByPropertyId(propertyId);
        propertyRepository.delete(property);
    }

    public List<com.example.starter.domain.Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    private AdminAgencyResponse mapToAgencyResponse(Agency agency) {
        return AdminAgencyResponse.builder()
                .id(agency.getId())
                .email(agency.getEmail())
                .fullName(agency.getFullName())
                .phone(agency.getPhone())
                .companyName(agency.getCompanyName())
                .ninea(agency.getNinea())
                .rccm(agency.getRccm())
                .address(agency.getAddress())
                .verified(agency.isVerified())
                .enabled(agency.isEnabled())
                .kycDocumentUrl(agency.getKycDocumentUrl())
                .profilePictureUrl(agency.getProfilePictureUrl())
                .subscriptionStatus(agency.getSubscriptionStatus())
                .build();
    }
}