package com.animehub.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.dto.AnimeMetadataImportRequest;
import com.animehub.dto.AnimeResponse;
import com.animehub.service.AnimeService;
import com.animehub.service.metadata.AnimeMetadata;
import com.animehub.service.metadata.AnimeMetadataService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/anime-metadata")
@PreAuthorize("hasRole('ADMIN')")
public class AnimeMetadataController {

    private final AnimeMetadataService metadataService;
    private final AnimeService animeService;

    public AnimeMetadataController(
            AnimeMetadataService metadataService,
            AnimeService animeService) {

        this.metadataService = metadataService;
        this.animeService = animeService;
    }

    @GetMapping("/search")
    public List<AnimeMetadata> searchAnime(
            @RequestParam String query) {

        return metadataService.search(query);
    }

    @PostMapping("/import")
    public AnimeResponse importAnime(
            @Valid @RequestBody AnimeMetadataImportRequest request) {

        AnimeMetadata metadata =
                metadataService.getByProvider(
                        request.provider(),
                        request.externalId()
                );

        return animeService.importMetadata(metadata);
    }
}