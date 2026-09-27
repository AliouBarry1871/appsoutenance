package com.example.starter.repository;

import com.example.starter.domain.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByTransactionRef(String transactionRef);
    java.util.List<PaymentTransaction> findByAgencyId(Long agencyId);
    java.util.List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
}