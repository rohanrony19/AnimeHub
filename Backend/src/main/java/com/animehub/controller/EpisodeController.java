package com.animehub.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.animehub.dto.EpisodeRequest;
import com.animehub.dto.EpisodeResponse;
import com.animehub.service.EpisodeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/episodes")
public class EpisodeController {

    private final EpisodeService service;

    public EpisodeController(EpisodeService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{animeId}")
    public EpisodeResponse saveEpisode(
            @PathVariable Long animeId,
            @Valid @RequestBody EpisodeRequest request) {

        return service.saveEpisode(animeId, request);
    }

    @GetMapping("/anime/{animeId}")
    public List<EpisodeResponse> getEpisodes(
            @PathVariable Long animeId) {

        return service.getEpisodesByAnime(animeId);
    }

    @GetMapping("/{id}")
    public EpisodeResponse getEpisodeById(
            @PathVariable Long id) {

        return service.getEpisodeById(id);
    }

    @GetMapping("/{id}/watch")
    public String watchEpisode(@PathVariable Long id) {

        return service.getById(id).getVideoUrl();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteEpisode(@PathVariable Long id) {

        service.deleteEpisode(id);

        return "Episode deleted successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public EpisodeResponse updateEpisode(
            @PathVariable Long id,
            @Valid @RequestBody EpisodeRequest request) {

        return service.updateEpisode(id, request);
    }

    @GetMapping
    public List<EpisodeResponse> getAllEpisodes() {
        return service.getAllEpisodes();
    }

    @GetMapping("/anime/{animeId}/season/{season}")
    public List<EpisodeResponse> getEpisodesBySeason(
            @PathVariable Long animeId,
            @PathVariable Integer season) {

        return service.getEpisodesBySeason(animeId, season);
    }

    @PostMapping("/{episodeId}/progress")
    public void saveProgress(
            @PathVariable Long episodeId,
            @RequestParam int watchedTimeInSeconds) {

        service.saveProgress(episodeId, watchedTimeInSeconds);
    }

    @GetMapping("/{episodeId}/progress")
    public Integer getProgress(
            @PathVariable Long episodeId) {

        return service.getProgress(episodeId);
    }
}