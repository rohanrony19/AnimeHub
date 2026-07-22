package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.animehub.dto.ReviewRequest;
import com.animehub.dto.ReviewResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Review;
import com.animehub.entity.User;
import com.animehub.repository.UserRepository;
import com.animehub.service.AnimeService;
import com.animehub.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final AnimeService animeService;
    private final UserRepository userRepository;

    public ReviewController(
            ReviewService reviewService,
            AnimeService animeService,
            UserRepository userRepository) {

        this.reviewService = reviewService;
        this.animeService = animeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{animeId}")
    public Review addReview(
            @PathVariable Long animeId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Anime anime = animeService.findAnimeEntity(animeId);

        return reviewService.addReview(
                user,
                anime,
                request.rating(),
                request.comment());
    }

    @GetMapping("/{animeId}")
    public List<ReviewResponse> getReviews(@PathVariable Long animeId) {

        Anime anime = animeService.findAnimeEntity(animeId);

        return reviewService.getReviews(anime);
    }
    
    @GetMapping("/{animeId}/average-rating")
    public Double getAverageRating(@PathVariable Long animeId) {

        Anime anime = animeService.findAnimeEntity(animeId);

        return reviewService.getAverageRating(anime);
    }
}