package com.animehub.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.service.JikanService;

@RestController
@RequestMapping("/api/jikan")
public class JikanController {

    private final JikanService service;

    public JikanController(JikanService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchAnime(
            @RequestParam String title) {

        return service.searchAnime(title);
    }
}