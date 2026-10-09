package com.animehub.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "continue_watching",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "anime_id"})
    }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContinueWatching {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Anime anime;

    @ManyToOne
    private Episode episode;

    private Integer watchedTimeInSeconds;

    private LocalDateTime updatedAt;
}