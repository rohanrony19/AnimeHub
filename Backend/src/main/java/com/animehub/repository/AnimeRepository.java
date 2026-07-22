package com.animehub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.animehub.entity.Anime;

@Repository
public interface AnimeRepository extends JpaRepository<Anime, Long> {

	List<Anime> findByTitleContainingIgnoreCase(String keyword);

	Page<Anime> findByGenreContainingIgnoreCase(
	        String genre,
	        Pageable pageable
	);

	Optional<Anime> findByMalId(Long malId);

	Optional<Anime> findByTitleIgnoreCase(String title);

}
