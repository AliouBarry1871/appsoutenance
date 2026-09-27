package com.example.starter.exception;

/**
 * Exception métier indépendante de HTTP.
 * Le service dit "absent" ; l'adaptateur web choisit ensuite le statut 404.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
