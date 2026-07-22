package com.animehub.dto;

import jakarta.validation.constraints.NotBlank;

public record NotificationRequest(

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Message is required")
        String message,

        @NotBlank(message = "sendType is required")
        String sendType,

        Long userId

) {}