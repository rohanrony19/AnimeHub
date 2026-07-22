package com.animehub.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class JikanService {

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public Long getMalIdByTitle(String title) {

        String encodedTitle = URLEncoder.encode(title, StandardCharsets.UTF_8);

        String url = "https://api.jikan.moe/v4/anime?q="
                + encodedTitle
                + "&limit=1";

        Map<String, Object> response =
                restTemplate.getForObject(url, Map.class);

        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.get("data");

        if (data == null || data.isEmpty()) {
            throw new RuntimeException("Anime not found in Jikan");
        }

        Number malId = (Number) data.get(0).get("mal_id");

        return malId.longValue();
    }
    
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchAnime(String title) {

        String encodedTitle =
                URLEncoder.encode(title, StandardCharsets.UTF_8);

        String url = "https://api.jikan.moe/v4/anime?q="
                + encodedTitle
                + "&limit=10";

        Map<String, Object> response =
                restTemplate.getForObject(url, Map.class);

        return (List<Map<String, Object>>) response.get("data");
    }
}