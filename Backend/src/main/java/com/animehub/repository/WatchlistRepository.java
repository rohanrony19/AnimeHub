package com.animehub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.animehub.entity.Anime;
import com.animehub.entity.User;
import com.animehub.entity.Watchlist;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUser(User user);
    
    boolean existsByUserAndAnime(User user, Anime anime);
    
    void deleteByUserAndAnime(User user, Anime anime);
    
    Optional<Watchlist> findByUserAndAnime_MalId(User user, Long malId);

}