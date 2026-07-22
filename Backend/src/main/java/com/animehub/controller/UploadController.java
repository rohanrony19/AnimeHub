package com.animehub.controller;

import java.io.IOException;
import java.util.Map; 

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.animehub.service.S3StorageService;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

	private final S3StorageService service;

	public UploadController(S3StorageService service) {
	    this.service = service;
	}

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam String animeTitle,
            @RequestParam Integer seasonNumber,
            @RequestParam Integer episodeNumber) throws IOException {

        return service.uploadVideo(
                file,
                animeTitle,
                seasonNumber,
                episodeNumber);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/image")
    public String uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam String folder,
            @RequestParam String fileName) throws IOException {
    	System.out.println("===== S3 uploadImage() called =====");
        return service.uploadImage(
                file,
                folder,
                fileName);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/trailer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadTrailer(
            @RequestParam("file") MultipartFile file,
            @RequestParam("animeTitle") String animeTitle) throws IOException {

        String url = service.uploadTrailer(file, animeTitle);

        return ResponseEntity.ok(Map.of(
                "url", url
        ));
    }
    
}