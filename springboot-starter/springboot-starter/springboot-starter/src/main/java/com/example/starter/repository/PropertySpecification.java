package com.example.starter.repository;

import com.example.starter.domain.Property;
import com.example.starter.domain.PropertyType;
import com.example.starter.domain.TransactionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PropertySpecification {

    public static Specification<Property> filterProperties(
            String city, String zone, PropertyType category,
            BigDecimal maxPrice, TransactionType transactionType) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.toLowerCase()));
            }

            if (zone != null && !zone.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("zone")), zone.toLowerCase()));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (transactionType != null) {
                predicates.add(cb.equal(root.get("transactionType"), transactionType));
            }

            // Seules les annonces disponibles sont visibles au public (exclut RESERVED, RENTED, SOLD, UNAVAILABLE)
            predicates.add(cb.or(
                    cb.isNull(root.get("status")),
                    cb.equal(root.get("status"), com.example.starter.domain.PropertyStatus.AVAILABLE)
            ));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}