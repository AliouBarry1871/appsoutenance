package com.example.starter.controller;

import com.example.starter.domain.Report;
import com.example.starter.dto.ReportRequest;
import com.example.starter.service.ReportService;
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
@RequestMapping({"/api/v1/reports", "/api/reports"})
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    private String extractUsername(UserDetails userDetails, Authentication authentication) {
        if (userDetails != null && userDetails.getUsername() != null && !userDetails.getUsername().isBlank()) {
            return userDetails.getUsername();
        }
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName();
        }
        throw new AccessDeniedException("Utilisateur non authentifié.");
    }

    // Authentifié : Seul un utilisateur connecté peut effectuer un signalement
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Report> createReport(
            @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        return ResponseEntity.ok(reportService.createReport(request, username));
    }

    // Administrateur : Revoir la liste de tous les signalements faits par la communauté
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Report> updateReportStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, status));
    }
}