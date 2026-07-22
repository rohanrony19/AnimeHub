package com.animehub.service;

import java.util.Collections;  
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.AnimeRequest;
import com.animehub.dto.AnimeResponse;
import com.animehub.dto.EpisodeResponse;
import com.animehub.entity.Anime;
import com.animehub.repository.AnimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.animehub.entity.Episode;
 
@Service
@Transactional
public class AnimeService {

    private final AnimeRepository repository;
    private final S3StorageService s3StorageService;
    
    private static final Logger logger =
            LoggerFactory.getLogger(AnimeService.class);

    public AnimeService(
            AnimeRepository repository,
            S3StorageService s3StorageService) {

        this.repository = repository;
        this.s3StorageService = s3StorageService;
    }

    public AnimeResponse mapToResponse(Anime anime) {

        return new AnimeResponse(
                anime.getId(),
                anime.getMalId(),
                anime.getTitle(),
                anime.getDescription(),
                anime.getGenre(),
                anime.getReleaseYear(),
                anime.getRating(),
                anime.getPosterUrl(),
                anime.getStatus(),
        		anime.getTrailerUrl(),
        		(anime.getEpisodes() == null
                ? Collections.<Episode>emptyList()
                : anime.getEpisodes())
                .stream()
                .map(episode -> new EpisodeResponse(
                        episode.getId(),
                        episode.getAnime().getTitle(),
                        episode.getSeasonNumber(),
                        episode.getEpisodeNumber(),
                        episode.getTitle(),
                        episode.getVideoUrl(),
                        episode.getDuration()
                ))
                .toList());
                
        		
    }

    // Save Anime
    public AnimeResponse saveAnime(AnimeRequest request) {

        Anime anime = new Anime();

        anime.setTitle(request.title());
        anime.setMalId(request.malId());
        anime.setDescription(request.description());
        anime.setGenre(request.genre());
        anime.setReleaseYear(request.releaseYear());
        anime.setRating(request.rating());
        anime.setPosterUrl(request.posterUrl());
        anime.setStatus(request.status());
        anime.setTrailerUrl(request.trailerUrl());
        
        Anime savedAnime = repository.save(anime);

        return mapToResponse(savedAnime);
    }
    
    public AnimeResponse updateAnime(
            Long id,
            AnimeRequest request) {

    	Anime anime = findAnimeEntity(id);

    	if (request.posterUrl() != null
    	        && !request.posterUrl().isBlank()
    	        && !request.posterUrl().equals(anime.getPosterUrl())) {

    	    s3StorageService.deleteFile(anime.getPosterUrl());
    	    anime.setPosterUrl(request.posterUrl());
    	}

    	if (request.trailerUrl() != null
    	        && !request.trailerUrl().isBlank()
    	        && !request.trailerUrl().equals(anime.getTrailerUrl())) {

    	    s3StorageService.deleteFile(anime.getTrailerUrl());
    	    anime.setTrailerUrl(request.trailerUrl());
    	}

    	anime.setTitle(request.title());
    	if (request.malId() != null) {
    	    anime.setMalId(request.malId());
    	}
    	anime.setDescription(request.description());
    	anime.setGenre(request.genre());
    	anime.setReleaseYear(request.releaseYear());
    	anime.setRating(request.rating());
    	anime.setStatus(request.status());

    	Anime updatedAnime = repository.save(anime);

    	return mapToResponse(updatedAnime);
    }
    
    public Anime findOrCreateAnime(AnimeRequest request) {
    	logger.debug("findOrCreateAnime called: " + request.title() + " | malId = " + request.malId());
        // 1. Already exists by MAL ID
        if (request.malId() != null) {
            Optional<Anime> byMalId = repository.findByMalId(request.malId());

            if (byMalId.isPresent()) {
                return byMalId.get();
            }
        }

        // 2. Already exists by title
        Optional<Anime> byTitle =
                repository.findByTitleIgnoreCase(request.title());

        if (byTitle.isPresent()) {

            Anime anime = byTitle.get();

            // Auto update MAL ID if missing
            if (anime.getMalId() == null && request.malId() != null) {

                anime.setMalId(request.malId());
                anime.setDescription(request.description());
                anime.setGenre(request.genre());
                anime.setReleaseYear(request.releaseYear());
                anime.setRating(request.rating());
                anime.setPosterUrl(request.posterUrl());
                anime.setStatus(request.status());
                anime.setTrailerUrl(request.trailerUrl());

                return repository.save(anime);
            }

            return anime;
        }

        // 3. Create new anime
        Anime anime = new Anime();

        anime.setMalId(request.malId());
        anime.setTitle(request.title());
        anime.setDescription(request.description());
        anime.setGenre(request.genre());
        anime.setReleaseYear(request.releaseYear());
        anime.setRating(request.rating());
        anime.setPosterUrl(request.posterUrl());
        anime.setStatus(request.status());
        anime.setTrailerUrl(request.trailerUrl());

        return repository.save(anime);
    }

    // Internal use by other services
    public Anime findAnimeEntity(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Anime not found"));
    }

    // Get one Anime DTO
    public AnimeResponse getAnimeById(Long id) {

        Anime anime = findAnimeEntity(id);

        return mapToResponse(anime);
    }

    // Get all Anime DTOs
    public List<AnimeResponse> getAllAnime() {

        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Search Anime DTOs
    public List<AnimeResponse> searchAnime(String keyword) {

        return repository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Pagination
    public Page<AnimeResponse> getAnimePage(
            int page,
            int size) {

        return repository.findAll(PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    // Delete Anime
    public void deleteAnime(Long id) {

        Anime anime = findAnimeEntity(id);

        s3StorageService.deleteFile(anime.getPosterUrl());
        s3StorageService.deleteFile(anime.getTrailerUrl());

        repository.delete(anime);
    }
    
    public Page<AnimeResponse> getAnimeByGenre(
            String genre,
            int page,
            int size) {

        return repository
                .findByGenreContainingIgnoreCase(
                        genre,
                        PageRequest.of(page, size)
                )
                .map(this::mapToResponse);
    }
    
    public Anime findByMalId(Long malId) {

        return repository.findByMalId(malId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anime not found"
                    ));
    }
    
    public AnimeResponse getAnimeByMalId(Long malId) {

        Anime anime = repository.findByMalId(malId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Anime not found"
                    ));

        return mapToResponse(anime);
    }

}