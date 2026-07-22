package com.animehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.dto.AnimeRequest;
import com.animehub.dto.AnimeResponse;
import com.animehub.entity.Anime;
import com.animehub.service.AnimeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/anime")
public class AnimeController {

    private final AnimeService service;

    public AnimeController(AnimeService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public AnimeResponse addAnime(
            @Valid @RequestBody AnimeRequest anime) {

        return service.saveAnime(anime);
    }

    @GetMapping
    public List<AnimeResponse> getAllAnime() {

        return service.getAllAnime();
    }

    @GetMapping("/{id}")
    public AnimeResponse getAnime(
            @PathVariable Long id) {

        return service.getAnimeById(id);
    }

    @GetMapping("/search")
    public List<AnimeResponse> searchAnime(
            @RequestParam String keyword) {

        return service.searchAnime(keyword);
    }

    @GetMapping("/page")
    public Page<AnimeResponse> getAnimePage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return service.getAnimePage(page, size);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteAnime(
            @PathVariable Long id) {

        service.deleteAnime(id);

        return "Anime deleted successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public AnimeResponse updateAnime(
            @PathVariable Long id,
            @Valid @RequestBody AnimeRequest anime) {

        return service.updateAnime(id, anime);
    }

    @GetMapping("/genre")
    public Page<AnimeResponse> getAnimeByGenre(
            @RequestParam String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return service.getAnimeByGenre(
                genre,
                page,
                size
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/find-or-create")
    public AnimeResponse findOrCreate(
            @Valid @RequestBody AnimeRequest request) {

        Anime anime = service.findOrCreateAnime(request);

        return service.mapToResponse(anime);
    }

    @GetMapping("/mal/{malId}")
    public AnimeResponse getAnimeByMalId(
            @PathVariable Long malId) {

        return service.getAnimeByMalId(malId);
    }

}