package com.animehub.dto;

import java.time.LocalDateTime;

public record NotificationResponse(

        Long id,
        String title,
        String message,
        boolean readStatus,
        LocalDateTime createdAt

) {}