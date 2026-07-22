package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.animehub.dto.CommentRequest;
import com.animehub.dto.CommentResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Comment;
import com.animehub.entity.User;
import com.animehub.repository.UserRepository;
import com.animehub.service.AnimeService;
import com.animehub.service.CommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final AnimeService animeService;
    private final UserRepository userRepository;

    public CommentController(
            CommentService commentService,
            AnimeService animeService,
            UserRepository userRepository) {

        this.commentService = commentService;
        this.animeService = animeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{animeId}")
    public Comment addComment(
            @PathVariable Long animeId,
            @Valid
            @RequestBody CommentRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Anime anime = animeService.findAnimeEntity(animeId);

        return commentService.addComment(
                user,
                anime,
                request.message());
    }

    @GetMapping("/{animeId}")
    public List<CommentResponse> getComments(
            @PathVariable Long animeId) {

        Anime anime = animeService.findAnimeEntity(animeId);

        return commentService.getComments(anime);
    }
}