package com.animehub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.animehub.entity.Anime;
import com.animehub.entity.Favorite;
import com.animehub.entity.User;

public interface FavoriteRepository extends JpaRepository<Favorite, Long>{

	List<Favorite> findByUser(User user);

    boolean existsByUserAndAnime(User user, Anime anime);

    void deleteByUserAndAnime(User user, Anime anime);
    
    @Query("""
    		SELECT f
    		FROM Favorite f
    		WHERE f.user = :user
    		AND f.anime.malId = :malId
    		""")
    		Optional<Favorite> findByUserAndMalId(User user, Long malId);
}
