package com.example.starter.service;

import com.example.starter.domain.Favorite;
import com.example.starter.domain.Property;
import com.example.starter.domain.User;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.FavoriteRepository;
import com.example.starter.repository.PropertyRepository;
import com.example.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addFavorite(Long propertyId, String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce introuvable"));

        if (!favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId)) {
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .property(property)
                    .build();
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long propertyId, String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        favoriteRepository.deleteByUserIdAndPropertyId(user.getId(), propertyId);
    }

    @Transactional(readOnly = true)
    public List<Property> getUserFavorites(String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        List<Long> propertyIds = favoriteRepository.findPropertyIdsByUserId(user.getId());
        if (propertyIds == null || propertyIds.isEmpty()) {
            return Collections.emptyList();
        }

        return propertyRepository.findByIdIn(propertyIds);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long propertyId, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return false;
        }
        return userRepository.findByEmailIgnoreCase(userEmail)
                .map(user -> favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId))
                .orElse(false);
    }
}