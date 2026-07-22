package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    
    @DeleteMapping("/{episodeId}")
    public String removeContinueWatching(
            @PathVariable Long episodeId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Episode episode = episodeService.getById(episodeId);

        continueWatchingService.removeProgress(user, episode);

        return "Continue watching removed successfully";
    }
}