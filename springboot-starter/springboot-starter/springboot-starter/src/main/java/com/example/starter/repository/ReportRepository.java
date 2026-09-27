package com.example.starter.repository;

import com.example.starter.domain.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @EntityGraph(attributePaths = {"reporter", "property"})
    @Override
    List<Report> findAll();

    @EntityGraph(attributePaths = {"reporter", "property"})
    @Override
    Optional<Report> findById(Long id);

    void deleteByPropertyId(Long propertyId);
}