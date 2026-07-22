package com.animehub.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.WatchlistResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Favorite;
import com.animehub.entity.User;
import com.animehub.entity.Watchlist;
import com.animehub.repository.WatchlistRepository;

@Service
@Transactional
public class WatchlistService {

    private final WatchlistRepository repository;

    public WatchlistService(WatchlistRepository repository) {
        this.repository = repository;
    }

    public Watchlist addToWatchlist(User user, Anime anime) {

        if (repository.existsByUserAndAnime(user, anime)) {
            throw new RuntimeException("Anime already exists in watchlist");
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setAnime(anime);

        return repository.save(watchlist);
    }

    public List<WatchlistResponse> getWatchlist(User user) {

        return repository.findByUser(user)
                .stream()
                .map(watchlist -> new WatchlistResponse(
                        watchlist.getAnime().getId(),
                        watchlist.getAnime().getMalId(),
                        watchlist.getAnime().getTitle(),
                        watchlist.getAnime().getPosterUrl(),
                        watchlist.getAnime().getGenre(),
                        watchlist.getAnime().getRating()
                ))
                .toList();
    }
    
    public void removeWatchlist(User user, Long malId) {

        Watchlist watchlist = repository.findByUserAndAnime_MalId(user, malId)
                .orElseThrow(() ->
                        new RuntimeException("Anime not found in favorites"));

        repository.delete(watchlist);
    }
}