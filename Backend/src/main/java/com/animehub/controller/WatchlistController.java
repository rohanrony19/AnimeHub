package com.animehub.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.dto.AnimeRequest;
import com.animehub.dto.WatchlistResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.User;
import com.animehub.entity.Watchlist;
import com.animehub.repository.UserRepository;
import com.animehub.service.AnimeService;
import com.animehub.service.WatchlistService;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

	private final WatchlistService watchlistService;
	private final AnimeService animeService;
	private final UserRepository userRepository;
	
	public WatchlistController(WatchlistService watchlistService, AnimeService animeService,
			UserRepository userRepository) {
		super();
		this.watchlistService = watchlistService;
		this.animeService = animeService;
		this.userRepository = userRepository;
	}
	
	@PostMapping
	public Watchlist addToWatchlist(
	        @RequestBody AnimeRequest request,
	        Authentication authentication) {

	    String username = authentication.getName();

	    User user = userRepository.findByEmail(username)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    Anime anime = animeService.findOrCreateAnime(request);

	    return watchlistService.addToWatchlist(user, anime);
	}

    @GetMapping
    public List<WatchlistResponse> getWatchlist(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return watchlistService.getWatchlist(user);
    }
    
    @DeleteMapping("/{animeId}")
    public String removeFromWatchlist(
            @PathVariable Long animeId,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        watchlistService.removeWatchlist(user, animeId);

        return "Anime removed from watchlist successfully";
    }
}
