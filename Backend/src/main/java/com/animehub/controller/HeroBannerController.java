package com.animehub.controller;

import com.animehub.dto.HeroBannerRequest;
import com.animehub.dto.HeroBannerResponse;
import com.animehub.service.HeroBannerService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/herobanners")
public class HeroBannerController {

    private final HeroBannerService service;

    public HeroBannerController(HeroBannerService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public HeroBannerResponse addBanner(@Valid @RequestBody HeroBannerRequest banner) {
        return service.addBanner(banner);
    }

    @GetMapping
    public List<HeroBannerResponse> getAllBanners() {
        return service.getAllBanners();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public HeroBannerResponse updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody HeroBannerRequest banner) {

        return service.updateBanner(id, banner);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteBanner(@PathVariable Long id) {
        service.deleteBanner(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sync-malids")
    public String syncMalIds() {

        service.updateAllHeroBannerMalIds();

        return "Hero Banner MAL IDs updated successfully.";
    }
}