package com.animehub.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeroBanner {

    @Id
    @GeneratedValue
    private Long id;
    
    private Long malId;
    private Integer displayOrder;
    private String title;
    private String description;
    private String bannerUrl;
    private Double rating;
    private Integer releaseYear;
    private String genre;
}