package com.example.starter.controller;

import com.example.starter.dto.PaymentRequest;
import com.example.starter.dto.PaymentResponse;
import com.example.starter.dto.WebhookCallbackRequest;
import com.example.starter.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/payments", "/api/payments"})
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('ROLE_AGENCY')")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(paymentService.initiatePayment(request, userDetails.getUsername()));
    }

    @PostMapping("/simulate-success/{transactionRef}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.Map<String, String>> simulateSuccess(@PathVariable String transactionRef) {
        String msg = paymentService.simulatePaymentSuccess(transactionRef);
        return ResponseEntity.ok(java.util.Map.of("message", msg));
    }

    @GetMapping("/my-transactions")
    @PreAuthorize("hasAuthority('ROLE_AGENCY')")
    public ResponseEntity<java.util.List<com.example.starter.domain.PaymentTransaction>> getMyTransactions(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(paymentService.getMyTransactions(userDetails.getUsername()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<java.util.List<com.example.starter.domain.PaymentTransaction>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }

    @PatchMapping("/approve-cash/{transactionRef}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> approveCash(@PathVariable String transactionRef) {
        String msg = paymentService.approveCashPayment(transactionRef);
        return ResponseEntity.ok(java.util.Map.of("message", msg));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookCallbackRequest callback) {
        String result = paymentService.processWebhook(callback);
        return ResponseEntity.ok(result);
    }
}