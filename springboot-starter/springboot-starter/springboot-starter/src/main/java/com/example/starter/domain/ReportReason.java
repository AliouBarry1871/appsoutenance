package com.example.starter.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ReportReason {
    FRAUD,
    FAKE_LISTING,
    INCORRECT_INFORMATION,
    MISLEADING_PRICE,
    INAPPROPRIATE_CONTENT,
    ALREADY_RENTED,
    SPAM,
    OTHER;

    @JsonCreator
    public static ReportReason fromString(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        for (ReportReason r : values()) {
            if (r.name().equalsIgnoreCase(value.trim())) {
                return r;
            }
        }
        String normalized = value.trim().toUpperCase();
        if (normalized.contains("FRAUD") || normalized.contains("FAKE") || normalized.contains("ARNAQUE")) {
            return FRAUD;
        }
        if (normalized.contains("PRICE") || normalized.contains("INCORRECT")) {
            return INCORRECT_INFORMATION;
        }
        return OTHER;
    }
}