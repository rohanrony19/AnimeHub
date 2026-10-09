package com.animehub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EpisodeRequest(

        @NotNull(message = "Anime ID is required")
        @Min(value = 1, message = "Anime ID must be at least 1")
        Long animeId,

        @Min(value = 1, message = "Season number must be at least 1")
        int seasonNumber,

        @Min(value = 1, message = "Episode number must be at least 1")
        int episodeNumber,

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Video URL is required")
        String videoUrl,

        String thumbnailUrl,

        @Min(value = 0, message = "Duration cannot be negative")
        int duration

) {}