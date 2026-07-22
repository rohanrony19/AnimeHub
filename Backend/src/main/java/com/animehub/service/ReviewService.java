package com.animehub.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.animehub.dto.ReviewResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.Review;
import com.animehub.entity.User;
import com.animehub.repository.ReviewRepository;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository repository;

    public ReviewService(ReviewRepository repository) {
        this.repository = repository;
    }

    public Review addReview(
            User user,
            Anime anime,
            Integer rating,
            String comment) {

        Review review = new Review();

        review.setUser(user);
        review.setAnime(anime);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());

        return repository.save(review);
    }

    public List<ReviewResponse> getReviews(Anime anime) {

        return repository.findByAnime(anime)
                .stream()
                .map(review -> new ReviewResponse(
                        review.getUser().getUsername(),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()))
                .toList();
    }

    public Double getAverageRating(Anime anime) {
        return repository.getAverageRating(anime);
    }
}