package com.animehub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.animehub.entity.ContinueWatching;
import com.animehub.entity.Episode;
import com.animehub.entity.User;

public interface ContinueWatchingRepository extends JpaRepository<ContinueWatching, Long>{

	List<ContinueWatching> findByUser(User user);

	Optional<ContinueWatching> findByUserAndEpisode(User user, Episode episode);
	
	void deleteByUserAndEpisode(User user, Episode episode);
}
