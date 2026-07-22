package com.animehub.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.FavoriteResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Favorite;
import com.animehub.entity.User;
import com.animehub.repository.FavoriteRepository;

@Service
@Transactional
public class FavoriteService {

    private final FavoriteRepository repository;
    
    private static final Logger logger =
            LoggerFactory.getLogger(AnimeService.class);

    public FavoriteService(FavoriteRepository repository) {
        this.repository = repository;
    }

    public Favorite addFavorite(User user, Anime anime) {

        if (repository.existsByUserAndAnime(user, anime)) {
            throw new RuntimeException("Anime already exists in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setAnime(anime);

        return repository.save(favorite);
    }

    public List<FavoriteResponse> getFavorites(User user) {

        return repository.findByUser(user)
                .stream()
                .map(favorite -> new FavoriteResponse(

                        favorite.getAnime().getId(),
                        favorite.getAnime().getMalId(),
                        favorite.getAnime().getTitle(),
                        favorite.getAnime().getPosterUrl(),
                        favorite.getAnime().getGenre(),
                        favorite.getAnime().getRating()

                ))
                .toList();
    }

    public void removeFavorite(User user, Long malId) {

    	logger.info("Received MAL ID = " + malId);

        repository.findByUser(user).forEach(f ->
            System.out.println(
                "Favorite -> Anime ID: " + f.getAnime().getId()
                + ", MAL ID: " + f.getAnime().getMalId()
                + ", Title: " + f.getAnime().getTitle()
            )
        );

        Favorite favorite = repository.findByUserAndMalId(user, malId)
                .orElseThrow(() ->
                        new RuntimeException("Anime not found in favorites"));

        repository.delete(favorite);
    }
}