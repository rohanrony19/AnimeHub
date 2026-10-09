package com.animehub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.animehub.entity.Anime;
import com.animehub.entity.ContinueWatching;
import com.animehub.entity.User;

public interface ContinueWatchingRepository
        extends JpaRepository<ContinueWatching, Long> {

	List<ContinueWatching> findByUserOrderByUpdatedAtDesc(User user);

    Optional<ContinueWatching> findByUserAndAnime(
            User user,
            Anime anime);
    
    void deleteByUserAndAnimeId(

            User user,

            Long animeId);
}