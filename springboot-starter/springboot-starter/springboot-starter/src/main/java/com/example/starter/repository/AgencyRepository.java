package com.example.starter.repository;

import com.example.starter.domain.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    Optional<Agency> findByEmail(String email);
    Optional<Agency> findByEmailIgnoreCase(String email);
    Boolean existsByEmail(String email);
}