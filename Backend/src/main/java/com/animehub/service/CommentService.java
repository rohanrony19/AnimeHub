package com.animehub.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.CommentResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Comment;
import com.animehub.entity.User;
import com.animehub.repository.CommentRepository;

@Service
@Transactional
public class CommentService {

    private final CommentRepository repository;

    public CommentService(CommentRepository repository) {
        this.repository = repository;
    }

    public Comment addComment(
            User user,
            Anime anime,
            String message) {

        Comment comment = new Comment();

        comment.setUser(user);
        comment.setAnime(anime);
        comment.setMessage(message);
        comment.setCreatedAt(LocalDateTime.now());

        return repository.save(comment);
    }

    public List<CommentResponse> getComments(Anime anime) {

        return repository.findByAnime(anime)
                .stream()
                .map(comment -> new CommentResponse(
                        comment.getUser().getUsername(),
                        comment.getMessage(),
                        comment.getCreatedAt()))
                .toList();
    }
}