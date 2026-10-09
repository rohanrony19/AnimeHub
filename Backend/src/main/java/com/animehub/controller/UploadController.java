package com.animehub.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map; 

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.animehub.dto.AnimeResponse;
import com.animehub.service.AnimeService;
import com.animehub.service.S3MultipartUploadService;
import com.animehub.service.S3StorageService;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

	private final S3StorageService service;
	private final AnimeService animeService;
	private final S3MultipartUploadService multipartUploadService;

	public UploadController(
	        S3StorageService service,
	        AnimeService animeService,
	        S3MultipartUploadService multipartUploadService) {

	    this.service = service;
	    this.animeService = animeService;
	    this.multipartUploadService = multipartUploadService;
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, String>> uploadVideo(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam String animeTitle,
	        @RequestParam Integer seasonNumber,
	        @RequestParam Integer episodeNumber) throws IOException {

	    Map<String, String> result =
	            service.uploadVideoWithThumbnail(
	                    file,
	                    animeTitle,
	                    seasonNumber,
	                    episodeNumber
	            );

	    return ResponseEntity.ok(result);
	}
	
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/video/multipart/init")
	public ResponseEntity<S3MultipartUploadService.MultipartUploadInitResponse>
	        initializeMultipartUpload(

	        @RequestParam String animeTitle,
	        @RequestParam Integer seasonNumber,
	        @RequestParam Integer episodeNumber,
	        @RequestParam String originalFileName,
	        @RequestParam String contentType,
	        @RequestParam long fileSize) {

	    S3MultipartUploadService.MultipartUploadInitResponse response =
	            multipartUploadService.initializeUpload(
	                    animeTitle,
	                    seasonNumber,
	                    episodeNumber,
	                    originalFileName,
	                    contentType,
	                    fileSize
	            );

	    return ResponseEntity.ok(response);
	}
	
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/video/multipart/complete")
	public ResponseEntity<Map<String, String>> completeMultipartUpload(
	        @RequestParam String uploadId,
	        @RequestParam String key,
	        @RequestParam String animeTitle,
	        @RequestParam Integer seasonNumber,
	        @RequestParam Integer episodeNumber,
	        @RequestBody List<S3MultipartUploadService.CompletedPartRequest> parts) throws IOException {

	    Map<String, String> result =
	            multipartUploadService.completeUpload(
	                    uploadId,
	                    key,
	                    parts,
	                    animeTitle,
	                    seasonNumber,
	                    episodeNumber
	            );

	    return ResponseEntity.ok(result);
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

        String thumbnailUrl =
                service.generateTrailerThumbnailFromUrl(url, animeTitle);

        return ResponseEntity.ok(Map.of(
                "url", url,
                "thumbnailUrl", thumbnailUrl
        ));
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/trailer/thumbnail")
    public ResponseEntity<Map<String, String>> regenerateTrailerThumbnail(
            @RequestParam Long animeId) throws IOException {

        AnimeResponse anime =
                animeService.regenerateTrailerThumbnail(animeId);

        return ResponseEntity.ok(
                Map.of(
                        "thumbnailUrl",
                        anime.trailerThumbnailUrl()
                )
        );
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/trailer/thumbnail/all")
    public ResponseEntity<Map<String, Integer>> regenerateAllTrailerThumbnails()
            throws IOException {

        int regenerated =
                animeService.regenerateAllTrailerThumbnails();

        return ResponseEntity.ok(
                Map.of("regenerated", regenerated)
        );
    }
}