package com.animehub.dto;

public record ContinueWatchingResponse(

        Long animeId,

        String animeTitle,

        String posterUrl,

        Long episodeId,

        Integer seasonNumber,

        Integer episodeNumber,

        String episodeTitle,

        String thumbnailUrl,

        Integer watchedTimeInSeconds,

        Integer duration

) {

}