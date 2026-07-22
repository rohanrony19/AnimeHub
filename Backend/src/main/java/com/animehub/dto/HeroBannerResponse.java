package com.animehub.dto;

public record HeroBannerResponse(

        Long id,
        String title,
        String description,
        String bannerUrl,
        String genre,
        Double rating,
        Integer releaseYear,
        Integer displayOrder,
        Long malId

) {}