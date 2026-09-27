package com.example.starter.dto;

import com.example.starter.domain.PropertyStatus;
import com.example.starter.domain.PropertyType;
import com.example.starter.domain.TransactionType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {

    @NotNull(message = "Le titre est obligatoire")
    private String title;

    @NotNull(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "Le prix est obligatoire")
    private BigDecimal price;

    private BigDecimal depositPrice; // Caution

    @NotNull(message = "La catégorie est obligatoire")
    private PropertyType category;

    @NotNull(message = "Le type de transaction est obligatoire")
    private TransactionType transactionType;

    @NotNull(message = "La ville est obligatoire")
    private String city;

    private String zone;
    private String address;

    // Avantages / Commodités
    private boolean hasBalcony;
    private boolean hasTerrace;
    private boolean hasAirConditioning;
    private boolean hasParking;

    private Integer rooms;
    private Double area;

    private PropertyStatus status;

    private List<String> imageUrls;

    @com.fasterxml.jackson.annotation.JsonProperty("images")
    public void setImagesFromPayload(List<Object> rawImages) {
        if (rawImages != null && (this.imageUrls == null || this.imageUrls.isEmpty())) {
            this.imageUrls = new java.util.ArrayList<>();
            for (Object obj : rawImages) {
                if (obj instanceof String s && !s.isBlank()) {
                    this.imageUrls.add(s);
                } else if (obj instanceof java.util.Map<?, ?> map && map.get("imageUrl") != null) {
                    this.imageUrls.add(map.get("imageUrl").toString());
                }
            }
        }
    }
}