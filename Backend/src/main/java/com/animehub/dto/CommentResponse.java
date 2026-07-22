package com.animehub.dto;

import java.time.LocalDateTime;

public record CommentResponse(

        String username,
        String message,
        LocalDateTime createdAt

) {
}