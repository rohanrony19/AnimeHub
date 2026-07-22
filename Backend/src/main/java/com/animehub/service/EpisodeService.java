package com.animehub.service;

import java.util.List;  

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.service.ContinueWatchingService;
import com.animehub.service.UserService;
import com.animehub.entity.User;
import com.animehub.dto.EpisodeRequest;
import com.animehub.dto.EpisodeResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Episode;
import com.animehub.repository.EpisodeRepository;

@Service
@Transactional
public class EpisodeService {

	private final EpisodeRepository repository;
	private final AnimeService animeService;
	private final ContinueWatchingService continueWatchingService;
	private final UserService userService;
	private final S3StorageService s3StorageService;

	public EpisodeService(
	        EpisodeRepository repository,
	        AnimeService animeService,
	        ContinueWatchingService continueWatchingService,
	        UserService userService,
	        S3StorageService s3StorageService) {

	    this.repository = repository;
	    this.animeService = animeService;
	    this.continueWatchingService = continueWatchingService;
	    this.userService = userService;
	    this.s3StorageService = s3StorageService;	
	}

    private EpisodeResponse mapToResponse(Episode episode) {

    	return new EpisodeResponse(
    		    episode.getId(),
    		    episode.getAnime().getTitle(),
    		    episode.getSeasonNumber(),
    		    episode.getEpisodeNumber(),
    		    episode.getTitle(),
    		    episode.getVideoUrl(),
    		    episode.getDuration()
    		);
    }

    public EpisodeResponse saveEpisode(
            Long animeId,
            EpisodeRequest request) {

        Anime anime = animeService.findAnimeEntity(animeId);

        Episode episode = new Episode();

        episode.setSeasonNumber(request.seasonNumber());
        episode.setEpisodeNumber(request.episodeNumber());
        episode.setTitle(request.title());
        episode.setVideoUrl(request.videoUrl());
        episode.setDuration(request.duration());
        episode.setAnime(anime);

        Episode savedEpisode = repository.save(episode);

        return mapToResponse(savedEpisode);
    }
    
    public EpisodeResponse updateEpisode(
            Long id,
            EpisodeRequest request) {

        Episode episode = getById(id);

        episode.setSeasonNumber(request.seasonNumber());
        episode.setEpisodeNumber(request.episodeNumber());
        episode.setTitle(request.title());
        if (request.videoUrl() != null
                && !request.videoUrl().isBlank()
                && !request.videoUrl().equals(episode.getVideoUrl())) {

            s3StorageService.deleteFile(episode.getVideoUrl());
            episode.setVideoUrl(request.videoUrl());
        }
        episode.setDuration(request.duration());

        Episode updatedEpisode = repository.save(episode);

        return mapToResponse(updatedEpisode);
    }

    public List<EpisodeResponse> getEpisodesByAnime(Long animeId) {

        Anime anime = animeService.findAnimeEntity(animeId);

        return repository
                .findByAnimeOrderBySeasonNumberAscEpisodeNumberAsc(anime)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    public EpisodeResponse getEpisodeById(Long id) {

        Episode episode = getById(id);

        return mapToResponse(episode);
    }
    
    public List<EpisodeResponse> getEpisodesBySeason(
            Long animeId,
            Integer seasonNumber) {

        Anime anime = animeService.findAnimeEntity(animeId);

        return repository
                .findByAnimeAndSeasonNumberOrderByEpisodeNumberAsc(anime, seasonNumber)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Episode getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Episode not found"));
    }
    
    public void deleteEpisode(Long id) {

        Episode episode = getById(id);

        s3StorageService.deleteFile(episode.getVideoUrl());

        repository.delete(episode);
    }
    
    public List<EpisodeResponse> getAllEpisodes() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    
    public void saveProgress(
            Long episodeId,
            Integer watchedTimeInSeconds) {

        User user = userService.getCurrentUser();

        Episode episode = getById(episodeId);

        continueWatchingService.saveProgress(
                user,
                episode,
                watchedTimeInSeconds);
    }
    
    public Integer getProgress(Long episodeId) {

        User user = userService.getCurrentUser();

        Episode episode = getById(episodeId);

        return continueWatchingService
                .getContinueWatching(user)
                .stream()
                .filter(item ->
                        item.episodeId().equals(episodeId))
                .findFirst()
                .map(item ->
                        item.watchedTimeInSeconds())
                .orElse(0);
    }
}