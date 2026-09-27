package com.example.starter.controller;

import com.example.starter.domain.Agency;
import com.example.starter.domain.PropertyStatus;
import com.example.starter.domain.Review;
import com.example.starter.dto.AgencyProfileResponse;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.AgencyRepository;
import com.example.starter.repository.PropertyRepository;
import com.example.starter.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/agencies", "/api/agencies"})
@RequiredArgsConstructor
public class AgencyController {

    private final AgencyRepository agencyRepository;
    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;

    @GetMapping
    public ResponseEntity<List<AgencyProfileResponse>> getAllPublicAgencies() {
        List<Agency> agencies = agencyRepository.findAll();
        List<AgencyProfileResponse> response = agencies.stream()
                .filter(Agency::isEnabled)
                .map(this::mapToProfile)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgencyProfileResponse> getAgencyProfile(@PathVariable Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agence introuvable avec l'ID : " + id));
        return ResponseEntity.ok(mapToProfile(agency));
    }

    private AgencyProfileResponse mapToProfile(Agency agency) {
        List<Review> reviews = reviewRepository.findByAgencyId(agency.getId());
        double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        double roundedRating = Math.round(avgRating * 10.0) / 10.0;

        int activeProps = (int) propertyRepository.findByAgencyId(agency.getId()).stream()
                .filter(p -> p.getStatus() == null || PropertyStatus.AVAILABLE.equals(p.getStatus()))
                .count();


        return AgencyProfileResponse.builder()
                .id(agency.getId())
                .companyName(agency.getCompanyName())
                .fullName(agency.getFullName())
                .email(agency.getEmail())
                .phone(agency.getPhone())
                .address(agency.getAddress())
                .ninea(agency.getNinea())
                .rccm(agency.getRccm())
                .verified(agency.isVerified())
                .profilePictureUrl(agency.getProfilePictureUrl())
                .subscriptionStatus(agency.getSubscriptionStatus())
                .averageRating(roundedRating)
                .totalReviews(reviews.size())
                .activePropertiesCount(activeProps)
                .build();
    }
}
