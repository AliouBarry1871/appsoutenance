package com.example.starter.controller;

import com.example.starter.domain.Property;
import com.example.starter.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/favorites", "/api/favorites"})
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    private String extractUsername(UserDetails userDetails, Authentication authentication) {
        if (userDetails != null && userDetails.getUsername() != null && !userDetails.getUsername().isBlank()) {
            return userDetails.getUsername();
        }
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName();
        }
        throw new AccessDeniedException("Utilisateur non authentifié.");
    }

    @PostMapping("/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> addFavorite(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        favoriteService.addFavorite(propertyId, username);
        return ResponseEntity.ok("Annonce ajoutée aux favoris avec succès.");
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> removeFavorite(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        favoriteService.removeFavorite(propertyId, username);
        return ResponseEntity.ok("Annonce retirée des favoris.");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Property>> getUserFavorites(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = extractUsername(userDetails, authentication);
        return ResponseEntity.ok(favoriteService.getUserFavorites(username));
    }

    @GetMapping("/check/{propertyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkIsFavorite(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = null;
        try {
            username = extractUsername(userDetails, authentication);
        } catch (Exception ignored) {
        }
        boolean fav = username != null && favoriteService.isFavorite(propertyId, username);
        return ResponseEntity.ok(Map.of("isFavorite", fav));
    }
}