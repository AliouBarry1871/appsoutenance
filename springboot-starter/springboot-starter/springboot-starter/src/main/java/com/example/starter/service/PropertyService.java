package com.example.starter.service;

import com.example.starter.domain.*;
import com.example.starter.domain.TransactionType;

import com.example.starter.dto.PropertyRequest;
import com.example.starter.exception.ResourceNotFoundException;
import com.example.starter.repository.AgencyRepository;
import com.example.starter.repository.PropertyRepository;
import com.example.starter.repository.PropertySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final AgencyRepository agencyRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<Property> searchProperties(String city, String zone, PropertyType category, BigDecimal maxPrice, TransactionType transactionType) {
        Specification<Property> spec = PropertySpecification.filterProperties(city, zone, category, maxPrice, transactionType);
        return propertyRepository.findAll(spec);
    }

    @Transactional(readOnly = true)
    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce non trouvée avec l'ID : " + id));
    }

    @Transactional(readOnly = true)
    public List<Property> getPropertiesByAgency(String agencyEmail) {
        Agency agency = agencyRepository.findByEmailIgnoreCase(agencyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agence non trouvée"));
        return propertyRepository.findByAgencyId(agency.getId());
    }

    @Transactional(readOnly = true)
    public List<Property> getPropertiesByAgencyId(Long agencyId) {
        return propertyRepository.findByAgencyId(agencyId);
    }

    @Transactional
    public Property createProperty(PropertyRequest request, List<MultipartFile> files, String agencyEmail) {
        Agency agency = agencyRepository.findByEmailIgnoreCase(agencyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agence non trouvée"));

        List<String> uploadedUrls = (files != null && !files.isEmpty())
                ? fileStorageService.storeFiles(files)
                : new ArrayList<>();

        List<String> allUrls = new ArrayList<>(uploadedUrls);
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            allUrls.addAll(request.getImageUrls());
        }

        if (allUrls.isEmpty()) {
            allUrls.add("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");
        }

        String desc = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription()
                : (request.getTitle() + " disponible à " + request.getCity() + (request.getZone() != null ? " (" + request.getZone() + ")" : "") + ".");

        Property property = Property.builder()
                .title(request.getTitle())
                .description(desc)
                .price(request.getPrice())
                .depositPrice(request.getDepositPrice())
                .category(request.getCategory())
                .transactionType(request.getTransactionType())
                .city(request.getCity())
                .zone(request.getZone())
                .address(request.getAddress())
                .hasBalcony(request.isHasBalcony())
                .hasTerrace(request.isHasTerrace())
                .hasAirConditioning(request.isHasAirConditioning())
                .hasParking(request.isHasParking())
                .rooms(request.getRooms() != null ? request.getRooms() : 1)
                .area(request.getArea() != null ? request.getArea() : 0.0)
                .status(request.getStatus() != null ? request.getStatus() : PropertyStatus.AVAILABLE)
                .agency(agency)
                .images(new ArrayList<>())
                .build();

        List<PropertyImage> images = allUrls.stream()
                .map(url -> PropertyImage.builder()
                        .imageUrl(url)
                        .property(property)
                        .build())
                .toList();
        property.getImages().addAll(images);

        return propertyRepository.save(property);
    }

    @Transactional
    public Property updateProperty(Long propertyId, PropertyRequest request, List<MultipartFile> files, String agencyEmail) {
        Property property = getPropertyAndVerifyOwner(propertyId, agencyEmail);

        List<String> newUploadedUrls = (files != null && !files.isEmpty())
                ? fileStorageService.storeFiles(files)
                : new ArrayList<>();

        List<String> allUrls = new ArrayList<>();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            allUrls.addAll(request.getImageUrls());
        }
        allUrls.addAll(newUploadedUrls);

        if (allUrls.isEmpty() && property.getImages() != null && !property.getImages().isEmpty()) {
            allUrls.addAll(property.getImages().stream().map(PropertyImage::getImageUrl).toList());
        }

        if (allUrls.isEmpty()) {
            throw new IllegalArgumentException("Il est obligatoire de conserver au moins une photo du bien.");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPrice(request.getPrice());
        property.setDepositPrice(request.getDepositPrice());
        property.setCategory(request.getCategory());
        property.setTransactionType(request.getTransactionType());
        property.setCity(request.getCity());
        property.setZone(request.getZone());
        property.setAddress(request.getAddress());
        property.setHasBalcony(request.isHasBalcony());
        property.setHasTerrace(request.isHasTerrace());
        property.setHasAirConditioning(request.isHasAirConditioning());
        property.setHasParking(request.isHasParking());
        if (request.getRooms() != null) {
            property.setRooms(request.getRooms());
        }
        if (request.getArea() != null) {
            property.setArea(request.getArea());
        }

        if (request.getStatus() != null) {
            property.setStatus(request.getStatus());
        }

        property.getImages().clear();
        List<PropertyImage> updatedImages = allUrls.stream()
                .map(url -> PropertyImage.builder()
                        .imageUrl(url)
                        .property(property)
                        .build())
                .toList();
        property.getImages().addAll(updatedImages);

        return propertyRepository.save(property);
    }

    @Transactional
    public Property updateStatus(Long propertyId, PropertyStatus status, String agencyEmail) {
        Property property = getPropertyAndVerifyOwner(propertyId, agencyEmail);
        property.setStatus(status);
        return propertyRepository.save(property);
    }

    @Transactional
    public Property reserveProperty(Long propertyId, com.example.starter.dto.ReservationRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce introuvable"));

        if (property.getStatus() == PropertyStatus.RESERVED) {
            throw new IllegalStateException("Ce bien est déjà réservé.");
        }

        // 1. Mise à jour du statut vers RESERVED (l'annonce disparaît des annonces disponibles)
        property.setStatus(PropertyStatus.RESERVED);
        Property updated = propertyRepository.save(property);

        // 2. Notification envoyée directement à l'agence immobilière propriétaire
        if (property.getAgency() != null) {
            String clientName = (request.getClientFullName() != null && !request.getClientFullName().isBlank())
                    ? request.getClientFullName().trim() : "Un client";
            String clientPhone = (request.getClientPhone() != null && !request.getClientPhone().isBlank())
                    ? request.getClientPhone().trim() : "Non renseigné";

            String title = "🏷️ Nouvelle réservation : " + property.getTitle();
            String message = "Le client " + clientName + " (Numéro de téléphone : " + clientPhone + ")"
                    + " a réservé votre bien \"" + property.getTitle() + "\" situé à " + property.getCity()
                    + (property.getZone() != null ? " - " + property.getZone() : "") + ".\n"
                    + "Veuillez contacter le client au " + clientPhone + " pour finaliser le dossier de location ou de vente.";

            if (request.getMessage() != null && !request.getMessage().isBlank()) {
                message += "\nMessage du client : \"" + request.getMessage().trim() + "\"";
            }

            notificationService.createNotification(property.getAgency(), title, message, "RESERVATION");
        }

        return updated;
    }

    @Transactional
    public void deleteProperty(Long propertyId, String agencyEmail) {
        Property property = getPropertyAndVerifyOwner(propertyId, agencyEmail);
        propertyRepository.delete(property);
    }

    private Property getPropertyAndVerifyOwner(Long propertyId, String agencyEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce introuvable"));

        if (!property.getAgency().getEmail().equalsIgnoreCase(agencyEmail)) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier cette annonce");
        }

        return property;
    }
}