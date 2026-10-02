package com.example.starter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String clientFullName;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    private String clientPhone;

    private String message;
}
