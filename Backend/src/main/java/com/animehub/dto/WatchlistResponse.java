package com.animehub.dto;

public record WatchlistResponse(

        Long animeId,
        Long malId,
        String title,
        String posterUrl,
        String genre,
        double rating

) {
}