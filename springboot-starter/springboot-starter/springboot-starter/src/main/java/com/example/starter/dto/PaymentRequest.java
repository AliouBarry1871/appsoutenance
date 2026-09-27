package com.example.starter.dto;

import com.example.starter.domain.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
}