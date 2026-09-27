package com.example.starter.exception;

import java.time.Instant;
import java.util.Map;

/** Format stable partagé par toutes les erreurs de l'API. */
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        Map<String, String> validationErrors
) {}
