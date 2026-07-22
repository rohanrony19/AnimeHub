package com.animehub.dto;

public record FavoriteResponse(

        Long animeId,
        Long malId,
        String title,
        String posterUrl,
        String genre,
        double rating

) {}