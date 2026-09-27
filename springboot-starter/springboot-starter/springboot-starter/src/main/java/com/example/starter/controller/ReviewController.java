package com.example.starter.controller;

import com.example.starter.domain.Review;
import com.example.starter.dto.ReviewRequest;
import com.example.starter.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/reviews", "/api/reviews"})
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final com.example.starter.repository.AgencyRepository agencyRepository;

    private String extractUsername(UserDetails userDetails, Authentication authentication) {
        if (userDetails != null && userDetails.getUsername() != null && !userDetails.getUsername().isBlank()) {
            return userDetails.getUsername();
        }
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName();
        }
        throw new AccessDeniedException("Utilisateur non authentifié.");
    }

    // Public : N'importe qui peut lire les avis
    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<Review>> getAgencyReviews(@PathVariable Long agencyId) {
        return ResponseEntity.ok(reviewService.getAgencyReviews(agencyId));
    }

    // Authentifié : Une agence connectée consulte ses propres avis
    @GetMapping("/my-agency")
    @PreAuthorize("hasAnyAuthority('ROLE_AGENCY', 'AGENCY')")
    public ResponseEntity<List<Review>> getMyAgencyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        com.example.starter.domain.Agency agency = agencyRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("Agence introuvable"));
        return ResponseEntity.ok(reviewService.getAgencyReviews(agency.getId()));
    }

    // Authentifié : Seul un utilisateur connecté peut laisser un avis
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Review> addReview(
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        return ResponseEntity.ok(reviewService.addReview(request, username));
    }
}