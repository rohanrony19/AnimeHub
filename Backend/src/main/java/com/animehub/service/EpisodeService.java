package com.animehub.service;

import java.io.IOException; 
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.service.ContinueWatchingService;
import com.animehub.service.UserService;
import com.animehub.entity.User;
import com.animehub.exception.BadRequestException;
import com.animehub.dto.EpisodeRequest;
import com.animehub.dto.EpisodeResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Episode;
import com.animehub.repository.EpisodeRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

@Service
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
	            episode.getThumbnailUrl(),
	            episode.getDuration()
	    );
	}

	@Transactional
	public EpisodeResponse saveEpisode(
	        Long animeId,
	        EpisodeRequest request) throws IOException {

	    Anime anime = animeService.findAnimeEntity(animeId);

	    Episode existingEpisode =
	            repository.findByAnimeAndSeasonNumberAndEpisodeNumber(
	                    anime,
	                    request.seasonNumber(),
	                    request.episodeNumber()
	            );

	    // Episode number already exists → replace/update it
	    if (existingEpisode != null) {

	        String oldVideoUrl = existingEpisode.getVideoUrl();
	        String oldThumbnailUrl = existingEpisode.getThumbnailUrl();

	        if (!Objects.equals(oldVideoUrl, request.videoUrl())) {

	            boolean videoUsedElsewhere =
	                    oldVideoUrl != null
	                            && repository.existsByVideoUrlAndIdNot(
	                                    oldVideoUrl,
	                                    existingEpisode.getId()
	                            );

	            boolean thumbnailUsedElsewhere =
	                    oldThumbnailUrl != null
	                            && repository.existsByThumbnailUrlAndIdNot(
	                                    oldThumbnailUrl,
	                                    existingEpisode.getId()
	                            );

	            if (!videoUsedElsewhere) {
	                s3StorageService.deleteFile(oldVideoUrl);
	            }

	            if (!thumbnailUsedElsewhere) {
	                s3StorageService.deleteFile(oldThumbnailUrl);
	            }
	        }

	        existingEpisode.setTitle(request.title());
	        existingEpisode.setVideoUrl(request.videoUrl());
	        existingEpisode.setDuration(request.duration());

	        if (request.thumbnailUrl() != null
	                && !request.thumbnailUrl().isBlank()) {

	            existingEpisode.setThumbnailUrl(request.thumbnailUrl());

	        } else if (request.videoUrl() != null
	                && !request.videoUrl().isBlank()) {

	            String thumbnailUrl =
	                    s3StorageService.generateEpisodeThumbnailFromUrl(
	                            request.videoUrl(),
	                            anime.getTitle(),
	                            request.seasonNumber(),
	                            request.episodeNumber()
	                    );

	            existingEpisode.setThumbnailUrl(thumbnailUrl);
	        }

	        Episode updatedEpisode = repository.save(existingEpisode);

	        return mapToResponse(updatedEpisode);
	    }

	    // Episode number doesn't exist → create new episode
	    Episode episode = new Episode();

	    episode.setAnime(anime);
	    episode.setSeasonNumber(request.seasonNumber());
	    episode.setEpisodeNumber(request.episodeNumber());
	    episode.setTitle(request.title());
	    episode.setVideoUrl(request.videoUrl());
	    episode.setDuration(request.duration());

	    if (request.thumbnailUrl() != null
	            && !request.thumbnailUrl().isBlank()) {

	        episode.setThumbnailUrl(request.thumbnailUrl());

	    } else if (request.videoUrl() != null
	            && !request.videoUrl().isBlank()) {

	        String thumbnailUrl =
	                s3StorageService.generateEpisodeThumbnailFromUrl(
	                        request.videoUrl(),
	                        anime.getTitle(),
	                        request.seasonNumber(),
	                        request.episodeNumber()
	                );

	        episode.setThumbnailUrl(thumbnailUrl);
	    }

	    Episode savedEpisode = repository.save(episode);

	    return mapToResponse(savedEpisode);
	}
    
	@Transactional
	public EpisodeResponse updateEpisode(
	        Long id,
	        EpisodeRequest request) throws IOException {

	    Episode episode = getById(id);

	    Anime anime = animeService.findAnimeEntity(request.animeId());

	    boolean episodeIdentityChanged =
	            !Objects.equals(episode.getAnime().getId(), anime.getId())
	                    || !Objects.equals(
	                            episode.getSeasonNumber(),
	                            request.seasonNumber()
	                    )
	                    || !Objects.equals(
	                            episode.getEpisodeNumber(),
	                            request.episodeNumber()
	                    );

	    if (episodeIdentityChanged) {

	        Episode targetEpisode =
	                repository.findByAnimeAndSeasonNumberAndEpisodeNumber(
	                        anime,
	                        request.seasonNumber(),
	                        request.episodeNumber()
	                );

	        if (targetEpisode != null) {

	            targetEpisode.setTitle(request.title());
	            targetEpisode.setVideoUrl(request.videoUrl());
	            targetEpisode.setDuration(request.duration());

	            if (request.thumbnailUrl() != null
	                    && !request.thumbnailUrl().isBlank()) {

	                targetEpisode.setThumbnailUrl(request.thumbnailUrl());
	            }

	            Episode updatedTarget =
	                    repository.save(targetEpisode);

	            return mapToResponse(updatedTarget);
	        }

	        Episode newEpisode = new Episode();

	        newEpisode.setAnime(anime);
	        newEpisode.setSeasonNumber(request.seasonNumber());
	        newEpisode.setEpisodeNumber(request.episodeNumber());
	        newEpisode.setTitle(request.title());
	        newEpisode.setVideoUrl(request.videoUrl());
	        newEpisode.setThumbnailUrl(request.thumbnailUrl());
	        newEpisode.setDuration(request.duration());

	        Episode savedEpisode =
	                repository.save(newEpisode);

	        return mapToResponse(savedEpisode);
	    }
	    /*
	     * Same Anime + Season + Episode number:
	     * update the existing episode normally.
	     */
	    episode.setTitle(request.title());

	    if (request.videoUrl() != null
	            && !request.videoUrl().isBlank()
	            && !request.videoUrl().equals(episode.getVideoUrl())) {

	        String oldVideoUrl = episode.getVideoUrl();
	        String oldThumbnailUrl = episode.getThumbnailUrl();

	        boolean videoUsedElsewhere =
	                oldVideoUrl != null
	                        && repository.existsByVideoUrlAndIdNot(
	                                oldVideoUrl,
	                                episode.getId()
	                        );

	        boolean thumbnailUsedElsewhere =
	                oldThumbnailUrl != null
	                        && repository.existsByThumbnailUrlAndIdNot(
	                                oldThumbnailUrl,
	                                episode.getId()
	                        );

	        if (!videoUsedElsewhere) {
	            s3StorageService.deleteFile(oldVideoUrl);
	        }

	        if (!thumbnailUsedElsewhere) {
	            s3StorageService.deleteFile(oldThumbnailUrl);
	        }

	        episode.setVideoUrl(request.videoUrl());

	        String thumbnailUrl =
	                s3StorageService.generateEpisodeThumbnailFromUrl(
	                        request.videoUrl(),
	                        anime.getTitle(),
	                        request.seasonNumber(),
	                        request.episodeNumber()
	                );

	        episode.setThumbnailUrl(thumbnailUrl);
	    }

	    if (request.thumbnailUrl() != null
	            && !request.thumbnailUrl().isBlank()) {

	        episode.setThumbnailUrl(request.thumbnailUrl());
	    }

	    episode.setDuration(request.duration());

	    Episode updatedEpisode = repository.save(episode);

	    return mapToResponse(updatedEpisode);
	}

    
	public List<EpisodeResponse> getEpisodesByAnime(Long animeId) {

	    Anime anime = animeService.findAnimeEntity(animeId);

	    List<Episode> episodes =
	            repository.findByAnimeOrderBySeasonNumberAscEpisodeNumberAsc(anime);

	    return episodes
	            .stream()
	            .map(this::mapToResponse)
	            .toList();
	}
	
	
	public EpisodeResponse getEpisodeById(Long id) {

	    Episode episode = getById(id);

	    return mapToResponse(episode);
	}
	
	@Transactional
	public EpisodeResponse regenerateEpisodeThumbnail(Long id) throws IOException {

	    Episode episode = getById(id);

	    String thumbnailUrl =
	            s3StorageService.generateEpisodeThumbnailFromUrl(
	                    episode.getVideoUrl(),
	                    episode.getAnime().getTitle(),
	                    episode.getSeasonNumber(),
	                    episode.getEpisodeNumber()
	            );

	    episode.setThumbnailUrl(thumbnailUrl);

	    Episode updatedEpisode = repository.save(episode);

	    return mapToResponse(updatedEpisode);
	}
    
	@Transactional
	public int regenerateAllEpisodeThumbnails() {

		List<Episode> episodes = repository.findAll()
		        .stream()
		        .filter(episode ->
		                episode.getVideoUrl() != null
		                        && !episode.getVideoUrl().isBlank()
		                        && episode.getVideoUrl().contains(".amazonaws.com/"))
		        .toList();

	    ExecutorService executor = Executors.newFixedThreadPool(4);
	    AtomicInteger regenerated = new AtomicInteger(0);

	    List<Future<?>> tasks = new ArrayList<>();

	    for (Episode episode : episodes) {

	        Long episodeId = episode.getId();
	        String videoUrl = episode.getVideoUrl();
	        String animeTitle = episode.getAnime().getTitle();
	        Integer seasonNumber = episode.getSeasonNumber();
	        Integer episodeNumber = episode.getEpisodeNumber();

	        tasks.add(executor.submit(() -> {
	            try {

	                String thumbnailUrl =
	                        s3StorageService.generateEpisodeThumbnailFromUrl(
	                                videoUrl,
	                                animeTitle,
	                                seasonNumber,
	                                episodeNumber
	                        );

	                Episode updatedEpisode =
	                        repository.findById(episodeId)
	                                .orElseThrow();

	                updatedEpisode.setThumbnailUrl(thumbnailUrl);
	                repository.save(updatedEpisode);

	                regenerated.incrementAndGet();

	            } catch (Exception e) {
	                System.err.println(
	                        "Thumbnail generation failed for episode "
	                                + episodeId + ": "
	                                + e.getMessage()
	                );
	            }
	        }));
	    }

	    for (Future<?> task : tasks) {
	        try {
	            task.get();
	        } catch (Exception e) {
	            System.err.println(
	                    "Thumbnail task failed: " + e.getMessage()
	            );
	        }
	    }

	    executor.shutdown();

	    return regenerated.get();
	}
	
	public List<EpisodeResponse> getEpisodesBySeason(
	        Long animeId,
	        Integer seasonNumber) {

	    Anime anime = animeService.findAnimeEntity(animeId);

	    List<Episode> episodes =
	            repository.findByAnimeAndSeasonNumberOrderByEpisodeNumberAsc(
	                    anime,
	                    seasonNumber
	            );

	    return episodes
	            .stream()
	            .map(this::mapToResponse)
	            .toList();
	}

    public Episode getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Episode not found"));
    }
    
    @Transactional
    public void deleteEpisode(Long id) {

        Episode episode = getById(id);

        String videoUrl = episode.getVideoUrl();
        String thumbnailUrl = episode.getThumbnailUrl();

        boolean videoUsedByOtherEpisode =
                videoUrl != null
                        && repository.existsByVideoUrlAndIdNot(videoUrl, id);

        boolean thumbnailUsedByOtherEpisode =
                thumbnailUrl != null
                        && repository.existsByThumbnailUrlAndIdNot(thumbnailUrl, id);

        if (!videoUsedByOtherEpisode) {
            s3StorageService.deleteFile(videoUrl);
        }

        if (!thumbnailUsedByOtherEpisode) {
            s3StorageService.deleteFile(thumbnailUrl);
        }

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