package com.animehub.service;

import com.animehub.dto.HeroBannerRequest; 
import com.animehub.dto.HeroBannerResponse;
import com.animehub.entity.Anime;
import com.animehub.entity.HeroBanner;
import com.animehub.repository.AnimeRepository;
import com.animehub.repository.HeroBannerRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HeroBannerService {

    private final HeroBannerRepository repository;
    private final JikanService jikanService;
    private final S3StorageService s3StorageService;
    
    private static final Logger logger =
            LoggerFactory.getLogger(AnimeService.class);

    public HeroBannerService(
            HeroBannerRepository repository,
            JikanService jikanService,
            S3StorageService s3StorageService) {

        this.repository = repository;
        this.jikanService = jikanService;
        this.s3StorageService = s3StorageService;
    }

    public HeroBannerResponse addBanner(HeroBannerRequest request) {

        HeroBanner banner = new HeroBanner();

        banner.setTitle(request.title());
        banner.setDescription(request.description());
        banner.setBannerUrl(request.bannerUrl());
        banner.setGenre(request.genre());
        banner.setRating(request.rating());
        banner.setReleaseYear(request.releaseYear());
        banner.setDisplayOrder(request.displayOrder());

        if (request.malId() != null) {
            banner.setMalId(request.malId());
        } else {
            try {
                Long malId = jikanService.getMalIdByTitle(request.title());
                banner.setMalId(malId);
            } catch (Exception e) {
                System.out.println("Unable to fetch MAL ID.");
            }
        }

        return map(repository.save(banner));
    }
    
    public void updateAllHeroBannerMalIds() {

        List<HeroBanner> banners = repository.findAll();

        for (HeroBanner banner : banners) {

            if (banner.getMalId() == null) {

            	try {
            		Long malId = jikanService.getMalIdByTitle(banner.getTitle());

            		banner.setMalId(malId);
            	} catch (Exception e) {
            		logger.error("Failed to upload episode", e);
            	}
            	repository.save(banner);

                try {
                    Thread.sleep(1200); // 1.2 second delay
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    public List<HeroBannerResponse> getAllBanners() {

        return repository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    public HeroBannerResponse updateBanner(Long id, HeroBannerRequest banner) {

        HeroBanner existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hero banner not found"));

        existing.setTitle(banner.title());
        existing.setDescription(banner.description());
        if (banner.bannerUrl() != null
                && !banner.bannerUrl().isBlank()
                && !banner.bannerUrl().equals(existing.getBannerUrl())) {

            s3StorageService.deleteFile(existing.getBannerUrl());
            existing.setBannerUrl(banner.bannerUrl());
        }
        existing.setDisplayOrder(banner.displayOrder());
        existing.setRating(banner.rating());
        existing.setReleaseYear(banner.releaseYear());
        existing.setGenre(banner.genre());

        if (banner.malId() != null) {
            existing.setMalId(banner.malId());
        } else {
            try {
                Long malId = jikanService.getMalIdByTitle(banner.title());
                existing.setMalId(malId);
            } catch (Exception e) {
                System.out.println("Unable to fetch MAL ID while updating.");
            }
        }

        return map(repository.save(existing));
    }

    public void deleteBanner(Long id) {

        HeroBanner banner = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hero banner not found"));

        s3StorageService.deleteFile(banner.getBannerUrl());

        repository.delete(banner);
    }
    
    private HeroBannerResponse map(HeroBanner banner) {

        return new HeroBannerResponse(
                banner.getId(),
                banner.getTitle(),
                banner.getDescription(),
                banner.getBannerUrl(),
                banner.getGenre(),
                banner.getRating(),
                banner.getReleaseYear(),
                banner.getDisplayOrder(),
                banner.getMalId()
        );
    }
}