package com.animehub.service.metadata;

public record AnimeMetadata(
        String provider,
        String externalId,
        String title,
        String description,
        String genre,
        int releaseYear,
        double rating,
        String posterUrl,
        String status,
        String trailerUrl,
        String trailerThumbnailUrl
) {}