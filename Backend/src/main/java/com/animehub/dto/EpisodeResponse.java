package com.animehub.dto;

public record EpisodeResponse(

	    Long id,
	    String animeTitle,
	    int seasonNumber,
	    int episodeNumber,
	    String title,
	    String videoUrl,
	    int duration

	) {}
