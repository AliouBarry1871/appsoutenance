package com.example.starter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Active l'audit JPA pour remplir automatiquement createdAt et updatedAt.
 * Les préoccupations techniques restent dans config/, loin du métier.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditConfig {
}
