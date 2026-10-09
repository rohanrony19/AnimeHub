package com.animehub.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.ContinueWatchingResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.ContinueWatching;
import com.animehub.entity.Episode;
import com.animehub.entity.User;
import com.animehub.repository.ContinueWatchingRepository;

@Service
@Transactional
public class ContinueWatchingService {

    private final ContinueWatchingRepository repository;

    public ContinueWatchingService(ContinueWatchingRepository repository) {
        this.repository = repository;
    }

    public ContinueWatching saveProgress(
            User user,
            Episode episode,
            Integer watchedTimeInSeconds) {

        Anime anime = episode.getAnime();

        ContinueWatching continueWatching =
                repository.findByUserAndAnime(user, anime)
                        .orElse(new ContinueWatching());

        continueWatching.setUser(user);
        continueWatching.setAnime(anime);
        continueWatching.setEpisode(episode);
        continueWatching.setWatchedTimeInSeconds(watchedTimeInSeconds);
        continueWatching.setUpdatedAt(LocalDateTime.now());

        return repository.save(continueWatching);
    }

    public List<ContinueWatchingResponse> getContinueWatching(User user) {

        return repository.findByUserOrderByUpdatedAtDesc(user)
                .stream()
                .map(progress -> new ContinueWatchingResponse(

                        progress.getEpisode().getAnime().getId(),

                        progress.getEpisode().getAnime().getTitle(),

                        progress.getEpisode().getAnime().getPosterUrl(),

                        progress.getEpisode().getId(),

                        progress.getEpisode().getSeasonNumber(),

                        progress.getEpisode().getEpisodeNumber(),

                        progress.getEpisode().getTitle(),

                        progress.getEpisode().getThumbnailUrl(),

                        progress.getWatchedTimeInSeconds(),

                        progress.getEpisode().getDuration()

                ))
                .toList();
    }

    public void removeProgress(User user, Long animeId) {

        repository.deleteByUserAndAnimeId(user, animeId);

    }
}