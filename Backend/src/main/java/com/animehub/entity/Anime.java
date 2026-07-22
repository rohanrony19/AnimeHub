package com.animehub.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class Anime {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true)
	private Long malId;
	
	private String title;
	
	@Column(columnDefinition = "TEXT")
	private String description;
	
	private String genre;
	
	private int releaseYear;
	
	private double rating;
	
	@Column(columnDefinition = "TEXT")
	private String posterUrl;
	
	private String status;
	
	@JsonIgnore
	@OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Episode> episodes;

	@JsonIgnore
	@OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Comment> comments;

	@JsonIgnore
	@OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Review> reviews;

	@JsonIgnore
	@OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Watchlist> watchlists;

	@JsonIgnore
	@OneToMany(mappedBy = "anime", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Favorite> favorites;
	
	private String trailerUrl;
	
}
