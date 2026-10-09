package com.animehub.service.metadata;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class JikanAnimeMetadataProvider implements AnimeMetadataProvider {

    private final RestClient restClient;

    public JikanAnimeMetadataProvider(
            @Value("${anime.metadata.jikan.base-url}")
            String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    @Override
    public String getProviderName() {
        return "JIKAN";
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<AnimeMetadata> search(String query) {

        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        Map<String, Object> response = restClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/anime")
                        .queryParam("q", query)
                        .queryParam("limit", 10)
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("data") == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.get("data");

        List<AnimeMetadata> results = new ArrayList<>();

        for (Map<String, Object> anime : data) {
            results.add(mapAnime(anime));
        }

        return results;
    }

    @Override
    public AnimeMetadata getById(String externalId) {

        Map<String, Object> response = restClient
                .get()
                .uri("/anime/{id}", externalId)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("data") == null) {
            throw new IllegalStateException(
                    "Anime not found from Jikan: " + externalId
            );
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> anime =
                (Map<String, Object>) response.get("data");

        return mapAnime(anime);
    }

    @SuppressWarnings("unchecked")
    private AnimeMetadata mapAnime(Map<String, Object> anime) {

        String externalId = valueAsString(anime.get("mal_id"));
        String title = valueAsString(anime.get("title"));
        String description = valueAsString(anime.get("synopsis"));
        String status = valueAsString(anime.get("status"));

        int releaseYear = valueAsInt(anime.get("year"));
        double rating = valueAsDouble(anime.get("score"));

        String genre = "";

        Object genresObject = anime.get("genres");

        if (genresObject instanceof List<?> genresList) {
            List<String> genreNames = new ArrayList<>();

            for (Object item : genresList) {
                if (item instanceof Map<?, ?> genreMap) {
                    Object name = genreMap.get("name");

                    if (name != null) {
                        genreNames.add(name.toString());
                    }
                }
            }

            genre = String.join(", ", genreNames);
        }

        String posterUrl = null;

        Object imagesObject = anime.get("images");

        if (imagesObject instanceof Map<?, ?> imagesMap) {

            Object jpgObject = imagesMap.get("jpg");

            if (jpgObject instanceof Map<?, ?> jpgMap) {
                Object largeImageUrl =
                        jpgMap.get("large_image_url");

                if (largeImageUrl != null) {
                    posterUrl = largeImageUrl.toString();
                }
            }
        }

        return new AnimeMetadata(
                getProviderName(),
                externalId,
                title,
                description,
                genre,
                releaseYear,
                rating,
                posterUrl,
                status,
                null,
                null
        );
    }

    private String valueAsString(Object value) {
        return value == null ? null : value.toString();
    }

    private int valueAsInt(Object value) {

        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return value == null
                    ? 0
                    : Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double valueAsDouble(Object value) {

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        try {
            return value == null
                    ? 0.0
                    : Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}