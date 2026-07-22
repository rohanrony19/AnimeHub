package com.animehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.animehub.entity.Anime;
import com.animehub.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByAnime(Anime anime);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.anime = :anime")
    Double getAverageRating(@Param("anime") Anime anime);

}