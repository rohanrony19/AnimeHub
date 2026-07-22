package com.animehub.dto;

import java.util.List;

public record AnimeResponse(

        Long id,
        Long malId,

        String title,
        String description,
        String genre,
        int releaseYear,
        double rating,
        String posterUrl,
        String status,
        String trailerUrl,
        List<EpisodeResponse> episodes

) {}
