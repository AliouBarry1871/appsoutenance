package com.example.starter.controller;

import com.example.starter.domain.SubscriptionStatus;
import com.example.starter.dto.AdminAgencyResponse;
import com.example.starter.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/agencies")
    public ResponseEntity<List<AdminAgencyResponse>> getAllAgencies() {
        return ResponseEntity.ok(adminService.getAllAgencies());
    }

    @PatchMapping("/agencies/{id}/verify")
    public ResponseEntity<AdminAgencyResponse> verifyAgency(
            @PathVariable Long id,
            @RequestParam boolean verified
    ) {
        return ResponseEntity.ok(adminService.verifyAgency(id, verified));
    }

    @PatchMapping("/agencies/{id}/status")
    public ResponseEntity<AdminAgencyResponse> toggleAgencyStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {
        return ResponseEntity.ok(adminService.toggleAgencyStatus(id, enabled));
    }

    @PatchMapping("/agencies/{id}/subscription")
    public ResponseEntity<AdminAgencyResponse> updateSubscriptionManually(
            @PathVariable Long id,
            @RequestParam SubscriptionStatus status
    ) {
        return ResponseEntity.ok(adminService.updateSubscriptionStatusManually(id, status));
    }

    @GetMapping("/properties")
    public ResponseEntity<List<com.example.starter.domain.Property>> getAllProperties() {
        return ResponseEntity.ok(adminService.getAllProperties());
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<String> deleteFraudulentProperty(@PathVariable Long id) {
        adminService.deleteFraudulentProperty(id);
        return ResponseEntity.ok("Annonce supprimée avec succès par l'administrateur.");
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<com.example.starter.domain.Review>> getAllReviews() {
        return ResponseEntity.ok(adminService.getAllReviews());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok("Avis supprimé avec succès par l'administrateur.");
    }
}