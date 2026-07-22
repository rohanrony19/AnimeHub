package com.animehub.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(

        @NotBlank(message = "Message cannot be empty")
        String message

) {
}