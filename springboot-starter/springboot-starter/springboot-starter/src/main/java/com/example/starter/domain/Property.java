package com.example.starter.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000, nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal depositPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Column(nullable = false)
    private String city;

    private String zone;
    private String address;

    @Builder.Default
    private boolean hasBalcony = false;

    @Builder.Default
    private boolean hasTerrace = false;

    @Builder.Default
    private boolean hasAirConditioning = false;

    @Builder.Default
    private boolean hasParking = false;

    @Builder.Default
    private Integer rooms = 1;

    @Builder.Default
    private Double area = 0.0;

    @Enumerated(EnumType.STRING)
    private PropertyStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agency_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "properties", "authorities"})
    private Agency agency;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonManagedReference
    private List<PropertyImage> images = new ArrayList<>();
}