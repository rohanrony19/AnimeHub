package com.animehub.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record AnimeRequest(

        @Positive(message = "malId must be positive")
        Long malId,

        @NotBlank(message = "Title is required")
        String title,

        String description,
        String genre,

        @Min(value = 0, message = "Release year cannot be negative")
        int releaseYear,

        @DecimalMin(value = "0.0", message = "Rating cannot be negative")
        @DecimalMax(value = "10.0", message = "Rating cannot exceed 10")
        double rating,

        String posterUrl,
        String status,
        String trailerUrl
) {}