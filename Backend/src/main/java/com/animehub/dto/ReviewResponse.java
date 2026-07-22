package com.animehub.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        String username,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}