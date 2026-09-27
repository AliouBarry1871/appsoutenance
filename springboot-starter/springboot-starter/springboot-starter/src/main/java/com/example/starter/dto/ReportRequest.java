package com.example.starter.dto;

import com.example.starter.domain.ReportReason;
import lombok.Data;

@Data
public class ReportRequest {
    private Long propertyId;
    private ReportReason reason;
    private String description;
}