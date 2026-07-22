package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.animehub.dto.AnimeRequest;
import com.animehub.dto.FavoriteResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Favorite;
import com.animehub.entity.User;
import com.animehub.exception.BadRequestException;
import com.animehub.repository.UserRepository;
import com.animehub.service.AnimeService;
import com.animehub.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final AnimeService animeService;
    private final UserRepository userRepository;

    public FavoriteController(
            FavoriteService favoriteService,
            AnimeService animeService,
            UserRepository userRepository) {

        this.favoriteService = favoriteService;
        this.animeService = animeService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Favorite addFavorite(
            @RequestBody AnimeRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        Anime anime = animeService.findOrCreateAnime(request);

        return favoriteService.addFavorite(user, anime);
    }

    @GetMapping
    public List<FavoriteResponse> getFavorites(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        return favoriteService.getFavorites(user);
    }

    @DeleteMapping("/{animeId}")
    public String removeFavorite(
            @PathVariable Long animeId,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        favoriteService.removeFavorite(user, animeId);

        return "Anime removed from favorites successfully";
    }
}