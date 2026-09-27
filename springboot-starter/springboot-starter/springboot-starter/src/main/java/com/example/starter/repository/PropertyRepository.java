package com.example.starter.repository;

import com.example.starter.domain.Property;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    @EntityGraph(attributePaths = {"agency", "images"})
    @Override
    List<Property> findAll();

    @EntityGraph(attributePaths = {"agency", "images"})
    @Override
    List<Property> findAll(@Nullable Specification<Property> spec);

    // 👈 NOUVEAU : Charge agency et images pour le clic "Voir les détails"
    @EntityGraph(attributePaths = {"agency", "images"})
    @Override
    Optional<Property> findById(Long id);

    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.agency LEFT JOIN FETCH p.images")
    List<Property> findAllWithRelations();

    // 👈 NOUVEAU : Récupération des annonces propres à l'agence connectée avec leurs relations
    @EntityGraph(attributePaths = {"agency", "images"})
    List<Property> findByAgencyId(Long agencyId);

    // 👈 NOUVEAU : Récupération des favoris avec leurs relations images et agence
    @EntityGraph(attributePaths = {"agency", "images"})
    List<Property> findByIdIn(List<Long> ids);
}