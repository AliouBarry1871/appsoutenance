package com.example.starter.dto;

import com.example.starter.domain.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PaymentResponse {
    private String transactionRef;
    private String paymentUrl;
    private PaymentStatus status;
    private String message;
}