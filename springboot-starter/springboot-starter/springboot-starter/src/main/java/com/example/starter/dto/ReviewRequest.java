package com.example.starter.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long agencyId;
    private int rating;
    private String comment;
}