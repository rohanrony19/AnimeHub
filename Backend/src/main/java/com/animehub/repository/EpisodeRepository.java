package com.animehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.animehub.entity.Anime;
import com.animehub.entity.Episode;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long>{

	List<Episode> findByAnimeOrderBySeasonNumberAscEpisodeNumberAsc(Anime anime);

	List<Episode> findByAnimeAndSeasonNumberOrderByEpisodeNumberAsc(
	        Anime anime,
	        Integer seasonNumber);
}
