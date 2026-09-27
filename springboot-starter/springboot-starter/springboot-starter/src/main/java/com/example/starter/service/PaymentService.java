package com.example.starter.service;

import com.example.starter.domain.*;
import com.example.starter.dto.PaymentRequest;
import com.example.starter.dto.PaymentResponse;
import com.example.starter.dto.WebhookCallbackRequest;
import com.example.starter.repository.AgencyRepository;
import com.example.starter.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final AgencyRepository agencyRepository;

    @Transactional
    public PaymentResponse initiatePayment(PaymentRequest request, String agencyEmail) {
        Agency agency = agencyRepository.findByEmail(agencyEmail)
                .orElseThrow(() -> new RuntimeException("Agence non trouvée pour l'email : " + agencyEmail));

        String transactionRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentTransaction transaction = PaymentTransaction.builder()
                .transactionRef(transactionRef)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .agency(agency)
                .build();

        paymentTransactionRepository.save(transaction);

        String paymentUrl = generatePaymentGatewayUrl(request.getPaymentMethod(), transactionRef);

        if (PaymentMethod.CASH.equals(request.getPaymentMethod())) {
            agency.setSubscriptionStatus(SubscriptionStatus.PENDING);
            agencyRepository.save(agency);
            return PaymentResponse.builder()
                    .transactionRef(transactionRef)
                    .paymentUrl(null)
                    .status(PaymentStatus.PENDING)
                    .message("Demande enregistrée. Veuillez effectuer le règlement en espèces auprès de l'administration.")
                    .build();
        }

        return PaymentResponse.builder()
                .transactionRef(transactionRef)
                .paymentUrl(paymentUrl)
                .status(PaymentStatus.PENDING)
                .message("Redirection vers la passerelle de paiement " + request.getPaymentMethod())
                .build();
    }

    @Transactional
    public String processWebhook(WebhookCallbackRequest callback) {
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionRef(callback.getTransactionRef())
                .orElseThrow(() -> new RuntimeException("Transaction introuvable : " + callback.getTransactionRef()));

        transaction.setStatus(callback.getStatus());
        paymentTransactionRepository.save(transaction);

        Agency agency = transaction.getAgency();
        if (PaymentStatus.SUCCESS.equals(callback.getStatus())) {
            agency.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            agencyRepository.save(agency);
            return "Paiement validé avec succès. Abonnement activé.";
        } else {
            agency.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
            agencyRepository.save(agency);
            return "Paiement échoué. Abonnement non activé.";
        }
    }

    @Transactional
    public String simulatePaymentSuccess(String transactionRef) {
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionRef(transactionRef)
                .orElseThrow(() -> new RuntimeException("Transaction introuvable : " + transactionRef));

        transaction.setStatus(PaymentStatus.SUCCESS);
        paymentTransactionRepository.save(transaction);

        Agency agency = transaction.getAgency();
        agency.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        agencyRepository.save(agency);

        return "Paiement simulé avec succès via " + transaction.getPaymentMethod() + ". Abonnement activé !";
    }

    @Transactional
    public String approveCashPayment(String transactionRef) {
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionRef(transactionRef)
                .orElseThrow(() -> new RuntimeException("Transaction introuvable : " + transactionRef));

        transaction.setStatus(PaymentStatus.SUCCESS);
        paymentTransactionRepository.save(transaction);

        Agency agency = transaction.getAgency();
        agency.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        agencyRepository.save(agency);

        return "Paiement en espèces validé. Abonnement activé !";
    }

    @Transactional(readOnly = true)
    public java.util.List<PaymentTransaction> getMyTransactions(String agencyEmail) {
        Agency agency = agencyRepository.findByEmail(agencyEmail)
                .orElseThrow(() -> new RuntimeException("Agence non trouvée : " + agencyEmail));
        return paymentTransactionRepository.findByAgencyId(agency.getId());
    }

    @Transactional(readOnly = true)
    public java.util.List<PaymentTransaction> getAllTransactions() {
        return paymentTransactionRepository.findAllByOrderByCreatedAtDesc();
    }

    private String generatePaymentGatewayUrl(PaymentMethod method, String ref) {
        return switch (method) {
            case WAVE -> "https://pay.wave.com/checkout?ref=" + ref;
            case ORANGE_MONEY -> "https://om.orange-sonatel.com/pay?ref=" + ref;
            case CARD -> "https://checkout.stripe.com/pay?ref=" + ref;
            default -> null;
        };
    }
}