package com.animehub.repository;

import com.animehub.entity.HeroBanner;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HeroBannerRepository
        extends JpaRepository<HeroBanner, Long> {
	List<HeroBanner> findAllByOrderByDisplayOrderAsc();
}