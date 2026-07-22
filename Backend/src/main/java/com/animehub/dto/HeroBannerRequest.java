package com.animehub.dto;

import jakarta.validation.constraints.NotBlank;

public record HeroBannerRequest(

		Long malId,
        @NotBlank(message = "Title is required")
        String title,
        String description,
        @NotBlank(message = "Image URL is required")
        String bannerUrl,
        String genre,
        Double rating,
        Integer releaseYear,
        Integer displayOrder

) {}