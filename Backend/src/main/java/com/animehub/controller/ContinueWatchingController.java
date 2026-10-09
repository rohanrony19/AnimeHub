package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.dto.ContinueWatchingResponse;
import com.animehub.entity.ContinueWatching;
import com.animehub.entity.Episode;
import com.animehub.entity.User;
import com.animehub.repository.UserRepository;
import com.animehub.service.ContinueWatchingService;
import com.animehub.service.EpisodeService;

@RestController
@RequestMapping("/api/continue-watching")
public class ContinueWatchingController {

    private final ContinueWatchingService continueWatchingService;
    private final EpisodeService episodeService;
    private final UserRepository userRepository;

    public ContinueWatchingController(
            ContinueWatchingService continueWatchingService,
            EpisodeService episodeService,
            UserRepository userRepository) {
        this.continueWatchingService = continueWatchingService;
        this.episodeService = episodeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{episodeId}")
    public ContinueWatching saveProgress(
            @PathVariable Long episodeId,
            @RequestParam Integer watchedTimeInSeconds,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Episode episode = episodeService.getById(episodeId);

        return continueWatchingService.saveProgress(
                user,
                episode,
                watchedTimeInSeconds);
    }

    @GetMapping
    public List<ContinueWatchingResponse> getContinueWatching(
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return continueWatchingService.getContinueWatching(user);
    }

    @DeleteMapping("/{animeId}")
    public String removeContinueWatching(

            @PathVariable Long animeId,

            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)

                .orElseThrow(() -> new RuntimeException("User not found"));

        continueWatchingService.removeProgress(user, animeId);

        return "Continue watching removed successfully";
    }
}