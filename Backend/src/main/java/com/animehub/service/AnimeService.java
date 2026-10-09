package com.animehub.service;

import java.io.IOException;
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
import com.animehub.service.metadata.AnimeMetadata;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.animehub.entity.Episode;
 
@Service
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
        		anime.getTrailerThumbnailUrl(),
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
                        episode.getThumbnailUrl(),
                        episode.getDuration()
                ))
                .toList());
                
        		
    }

    // Save Anime
    @Transactional
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
        anime.setTrailerThumbnailUrl(request.trailerThumbnailUrl());
        
        Anime savedAnime = repository.save(anime);

        return mapToResponse(savedAnime);
    }
    
    @Transactional
    public AnimeResponse updateAnime(
            Long id,
            AnimeRequest request) throws IOException {

        Anime anime = findAnimeEntity(id);

        if (request.posterUrl() != null
                && !request.posterUrl().isBlank()
                && !request.posterUrl().equals(anime.getPosterUrl())) {

            s3StorageService.deleteFile(anime.getPosterUrl());
            anime.setPosterUrl(request.posterUrl());
        }

        if (request.trailerUrl() != null
                && !request.trailerUrl().isBlank()) {

            if (!request.trailerUrl().equals(anime.getTrailerUrl())) {

                s3StorageService.deleteFile(anime.getTrailerUrl());
                s3StorageService.deleteFile(
                        anime.getTrailerThumbnailUrl()
                );

                anime.setTrailerUrl(request.trailerUrl());

                if (request.trailerThumbnailUrl() != null
                        && !request.trailerThumbnailUrl().isBlank()) {

                    anime.setTrailerThumbnailUrl(
                            request.trailerThumbnailUrl()
                    );
                }
            }
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
    
    @Transactional
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
                anime.setTrailerThumbnailUrl(request.trailerThumbnailUrl());

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
        anime.setTrailerThumbnailUrl(request.trailerThumbnailUrl());

        return repository.save(anime);
    }

    // Internal use by other services
    public Anime findAnimeEntity(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Anime not found"));
    }

    public AnimeResponse regenerateTrailerThumbnail(Long id) throws IOException {

        Anime anime = findAnimeEntity(id);

        String thumbnailUrl =
                s3StorageService.generateTrailerThumbnailFromUrl(
                        anime.getTrailerUrl(),
                        anime.getTitle()
                );

        anime.setTrailerThumbnailUrl(thumbnailUrl);

        Anime updatedAnime = repository.save(anime);

        return mapToResponse(updatedAnime);
    }
    
    @Transactional
    public int regenerateAllTrailerThumbnails() {

        List<Anime> animeList = repository.findAll();

        int regenerated = 0;

        for (Anime anime : animeList) {

            if (anime.getTrailerUrl() == null
                    || anime.getTrailerUrl().isBlank()) {
                continue;
            }

            try {
                String thumbnailUrl =
                        s3StorageService.generateTrailerThumbnailFromUrl(
                                anime.getTrailerUrl(),
                                anime.getTitle()
                        );

                anime.setTrailerThumbnailUrl(thumbnailUrl);

                repository.save(anime);

                regenerated++;

            } catch (Exception e) {
                logger.error(
                        "Failed to regenerate trailer thumbnail for anime ID {}: {}",
                        anime.getId(),
                        e.getMessage()
                );
            }
        }

        return regenerated;
    }
    
    // Get one Anime DTO
    public AnimeResponse getAnimeById(Long id) throws IOException {

        Anime anime = findAnimeEntity(id);

        if ((anime.getTrailerThumbnailUrl() == null
                || anime.getTrailerThumbnailUrl().isBlank())
                && anime.getTrailerUrl() != null
                && !anime.getTrailerUrl().isBlank()) {

            String thumbnailUrl =
                    s3StorageService.generateTrailerThumbnailFromUrl(
                            anime.getTrailerUrl(),
                            anime.getTitle()
                    );

            anime.setTrailerThumbnailUrl(thumbnailUrl);

            repository.save(anime);
        }

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
    @Transactional
    public void deleteAnime(Long id) {

        Anime anime = findAnimeEntity(id);

        s3StorageService.deleteFile(anime.getPosterUrl());
        s3StorageService.deleteFile(anime.getTrailerUrl());
        s3StorageService.deleteFile(anime.getTrailerThumbnailUrl());

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
    
    @Transactional
    public AnimeResponse importMetadata(AnimeMetadata metadata) {

        Long malId = null;

        if ("JIKAN".equalsIgnoreCase(metadata.provider())
                && metadata.externalId() != null
                && !metadata.externalId().isBlank()) {

            try {
                malId = Long.valueOf(metadata.externalId());
            } catch (NumberFormatException ignored) {
                // Keep malId null if the provider ID is not numeric.
            }
        }

        AnimeRequest request = new AnimeRequest(
                malId,
                metadata.title(),
                metadata.description(),
                metadata.genre(),
                metadata.releaseYear(),
                metadata.rating(),
                metadata.posterUrl(),
                normalizeStatus(metadata.status()),
                metadata.trailerUrl(),
                metadata.trailerThumbnailUrl()
        );

        Anime anime = findOrCreateAnime(request);

        return mapToResponse(anime);
    }

    private String normalizeStatus(String status) {

        if (status == null || status.isBlank()) {
            return "";
        }

        return switch (status) {
            case "Currently Airing" -> "ONGOING";
            case "Finished Airing" -> "COMPLETED";
            case "Not yet aired" -> "UPCOMING";
            default -> status;
        };
    }

}