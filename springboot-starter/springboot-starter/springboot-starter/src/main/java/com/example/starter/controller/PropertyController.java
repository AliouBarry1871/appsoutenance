package com.example.starter.controller;

import com.example.starter.domain.Property;
import com.example.starter.domain.PropertyStatus;
import com.example.starter.domain.PropertyType;
import com.example.starter.domain.TransactionType;
import com.example.starter.dto.PropertyRequest;
import com.example.starter.service.PropertyService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/properties", "/api/properties"})
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // --- Endpoints Publics (Consultation) ---

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) PropertyType category,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) TransactionType type
    ) {
        return ResponseEntity.ok(propertyService.searchProperties(city, zone, category, maxPrice, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<Property>> getPropertiesByAgencyId(@PathVariable Long agencyId) {
        return ResponseEntity.ok(propertyService.getPropertiesByAgencyId(agencyId));
    }

    // Réservation d'un bien par un client (disparition immédiate de l'annonce et notification agence)
    @PostMapping("/{id}/reserve")
    public ResponseEntity<Property> reserveProperty(
            @PathVariable Long id,
            @RequestBody @jakarta.validation.Valid com.example.starter.dto.ReservationRequest request
    ) {
        return ResponseEntity.ok(propertyService.reserveProperty(id, request));
    }

    // --- Endpoints Protégés (Agence & Administration) ---

    @GetMapping("/my-properties")
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<List<Property>> getMyProperties(Authentication authentication) {
        return ResponseEntity.ok(propertyService.getPropertiesByAgency(extractUsername(authentication)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Property> createProperty(
            @RequestPart("data") PropertyRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyService.createProperty(request, images, extractUsername(authentication)));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Property> createPropertyJson(
            @RequestBody PropertyRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(propertyService.createProperty(request, null, extractUsername(authentication)));
    }

    // Modification avec envoi de nouveaux fichiers (Multipart)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Property> updatePropertyMultipart(
            @PathVariable Long id,
            @RequestPart("data") PropertyRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication
    ) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request, images, extractUsername(authentication)));
    }

    // Modification sans nouveaux fichiers (JSON)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Property> updatePropertyJson(
            @PathVariable Long id,
            @RequestBody PropertyRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request, null, extractUsername(authentication)));
    }

    // Mise à jour rapide du statut (ex: DISPONIBLE, LOUE)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Property> updateStatus(
            @PathVariable Long id,
            @RequestParam PropertyStatus status,
            Authentication authentication
    ) {
        return ResponseEntity.ok(propertyService.updateStatus(id, status, extractUsername(authentication)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENCY', 'ADMIN') or hasAnyAuthority('ROLE_AGENCY', 'AGENCY', 'ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            Authentication authentication
    ) {
        propertyService.deleteProperty(id, extractUsername(authentication));
        return ResponseEntity.noContent().build();
    }

    // --- Helper Interne ---

    private String extractUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new AccessDeniedException("Session expirée ou utilisateur non authentifié.");
        }
        return authentication.getName();
    }
}