package com.animehub.dto;

public record ContinueWatchingResponse(

        Long animeId,
        String animeTitle,
        String posterUrl,
        Long episodeId,
        String episodeTitle,
        Integer watchedTimeInSeconds,
        Integer duration

) {
}