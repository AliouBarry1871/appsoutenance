package com.example.starter.dto;

import com.example.starter.domain.PaymentStatus;
import lombok.Data;

@Data
public class WebhookCallbackRequest {
    private String transactionRef;
    private PaymentStatus status;
}