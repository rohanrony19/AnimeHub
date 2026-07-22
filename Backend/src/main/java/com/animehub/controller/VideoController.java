package com.animehub.controller;

import java.io.IOException;
import java.nio.file.Path;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.animehub.exception.BadRequestException;
import com.animehub.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

	private static final Path VIDEO_DIR =
			Path.of("src/main/resources/static/videos").toAbsolutePath().normalize();

	@GetMapping("/{fileName}")
	public ResponseEntity<Resource> streamVideo(
	        @PathVariable String fileName,
	        @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {

	    // Reject anything that isn't a plain filename before it ever
	    // touches the filesystem — blocks "../", absolute paths, and
	    // path separators used for traversal.
	    if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
	        throw new BadRequestException("Invalid file name");
	    }

	    Path resolvedPath = VIDEO_DIR.resolve(fileName).normalize();

	    if (!resolvedPath.startsWith(VIDEO_DIR)) {
	        throw new BadRequestException("Invalid file name");
	    }

	    Resource resource = new FileSystemResource(resolvedPath);

	    if (!resource.exists()) {
	        throw new ResourceNotFoundException("Video not found");
	    }

	    long fileLength = resource.contentLength();

	    if (rangeHeader == null) {
	        return ResponseEntity.ok()
	                .contentType(MediaType.valueOf("video/mp4"))
	                .contentLength(fileLength)
	                .body(resource);
	    }

	    String[] ranges = rangeHeader.replace("bytes=", "").split("-");
	    long start = Long.parseLong(ranges[0]);
	    long end = ranges.length > 1 ? Long.parseLong(ranges[1]) : fileLength - 1;

	    long contentLength = end - start + 1;

	    HttpHeaders headers = new HttpHeaders();
	    headers.add("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
	    headers.add("Accept-Ranges", "bytes");

	    return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
	            .headers(headers)
	            .contentLength(contentLength)
	            .contentType(MediaType.valueOf("video/mp4"))
	            .body(resource);
	}
}