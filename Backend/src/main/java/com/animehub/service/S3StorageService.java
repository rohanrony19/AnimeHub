package com.animehub.service;

import java.io.IOException; 
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import java.time.Duration;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import javax.imageio.ImageIO;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;

@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;
    
    @Value("${AWS_REGION}")
    private String region;

    public String uploadImage(MultipartFile file, String folder, String fileName) throws IOException {
    	
    	if (file.isEmpty()) {
    	    throw new IllegalArgumentException("File is empty");
    	}

        String key = "animehub/" + folder + "/" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        try (var inputStream = file.getInputStream()) {

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(
                            inputStream,
                            file.getSize()
                    )
            );
        }

        return String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key	
        );
    }
    
    public String uploadTrailer(MultipartFile file, String animeTitle) throws IOException {
    	
    	if (file.isEmpty()) {
    	    throw new IllegalArgumentException("File is empty");
    	}

        String key = String.format(
                "animehub/%s/Trailer/Official-Trailer.%s",
                animeTitle,
                getExtension(file.getOriginalFilename())
        );

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        try (var inputStream = file.getInputStream()) {

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(
                            inputStream,
                            file.getSize()
                    )
            );
        }

        return String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key
        );
    }
    
    private String getExtension(String fileName) {

        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }
    
    public String uploadVideo(
            MultipartFile file,
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber) throws IOException {
    	
    	if (file.isEmpty()) {
    	    throw new IllegalArgumentException("File is empty");
    	}

        String key = String.format(
                "animehub/%s/Season-%d/Episode-%d.%s",
                animeTitle,
                seasonNumber,
                episodeNumber,
                getExtension(file.getOriginalFilename())
        );

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        try (var inputStream = file.getInputStream()) {

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(
                            inputStream,
                            file.getSize()
                    )
            );
        }

        return String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key
        );
    }
    
    public void deleteFile(String fileUrl) {

        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        if (!fileUrl.contains(".amazonaws.com/")) {
            return;
        }

        try {

            String key = fileUrl.substring(
                    fileUrl.indexOf(".amazonaws.com/") + ".amazonaws.com/".length()
            );

            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(request);

        } catch (Exception e) {
            System.err.println("Failed to delete S3 file: " + fileUrl);
            e.printStackTrace();
        }
    }
    
    public String generateTrailerThumbnailFromUrl(
            String trailerUrl,
            String animeTitle) throws IOException {

        if (trailerUrl == null || trailerUrl.isBlank()) {
            throw new IllegalArgumentException("Trailer URL is empty");
        }

        try (
            FFmpegFrameGrabber grabber =
                    new FFmpegFrameGrabber(trailerUrl);
            Java2DFrameConverter converter =
                    new Java2DFrameConverter()
        ) {

            grabber.start();

            grabber.setTimestamp(5_000_000L);

            BufferedImage image =
                    converter.convert(grabber.grabImage());

            if (image == null) {
                throw new IOException(
                        "Could not extract frame at 4 seconds"
                );
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            ImageIO.write(image, "jpg", output);

            String thumbnailKey = String.format(
                    "animehub/%s/Trailer/Trailer-Thumbnail.jpg",
                    animeTitle
            );

            PutObjectRequest putRequest =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(thumbnailKey)
                            .contentType("image/jpeg")
                            .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromBytes(output.toByteArray())
            );

            return String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    region,
                    thumbnailKey
            );
        }
    }
    
    public String generateEpisodeThumbnailFromUrl(
            String videoUrl,
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber) throws IOException {

        if (videoUrl == null || videoUrl.isBlank()) {
            throw new IllegalArgumentException("Video URL is empty");
        }

        String key = videoUrl.substring(
                videoUrl.indexOf(".amazonaws.com/") + ".amazonaws.com/".length()
        );

        GetObjectRequest getObjectRequest =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(30))
                        .getObjectRequest(getObjectRequest)
                        .build();

        String presignedUrl =
                s3Presigner.presignGetObject(presignRequest)
                        .url()
                        .toString();

        try (
            FFmpegFrameGrabber grabber =
                    new FFmpegFrameGrabber(presignedUrl);
            Java2DFrameConverter converter =
                    new Java2DFrameConverter()
        ) {

            grabber.start();

            grabber.setVideoStream(0);
            grabber.setVideoTimestamp(5_000_000L);

            Frame frame = null;

            int videoWidth = grabber.getImageWidth();
            int videoHeight = grabber.getImageHeight();

            for (int i = 0; i < 30; i++) {

                Frame candidate = grabber.grabImage();

                if (candidate == null) {
                    continue;
                }

                if (candidate.imageWidth == videoWidth &&
                    candidate.imageHeight == videoHeight) {

                    frame = candidate;
                    break;
                }
            }

            if (frame == null) {
                throw new IOException(
                        "Could not extract actual video frame at 5 seconds"
                );
            }

            BufferedImage image =
                    converter.convert(frame);

            if (image == null) {
                throw new IOException(
                        "Could not convert video frame to image"
                );
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            ImageIO.write(image, "jpg", output);

            String thumbnailKey = String.format(
                    "animehub/%s/Season-%d/Episode-%d-Thumbnail-%d.jpg",
                    animeTitle,
                    seasonNumber,
                    episodeNumber,
                    System.currentTimeMillis()
            );

            PutObjectRequest putRequest =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(thumbnailKey)
                            .contentType("image/jpeg")
                            .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromBytes(output.toByteArray())
            );

            return String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    region,
                    thumbnailKey
            );
        }
    }
    
    public Map<String, String> uploadVideoWithThumbnail(
            MultipartFile file,
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        Path tempVideo =
                Files.createTempFile("animehub-", ".video");

        String videoUrl = null;

        try {
            // Store the uploaded file locally once.
            file.transferTo(tempVideo);

            // -----------------------------
            // 1. Upload video to S3
            // -----------------------------
            String key = String.format(
                    "animehub/%s/Season-%d/Episode-%d.%s",
                    animeTitle,
                    seasonNumber,
                    episodeNumber,
                    getExtension(file.getOriginalFilename())
            );

            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromFile(tempVideo)
            );

            videoUrl = String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    region,
                    key
            );

            // -----------------------------
            // 2. Generate thumbnail
            //    directly from local file
            // -----------------------------
            String thumbnailUrl =
                    generateEpisodeThumbnailFromFile(
                            tempVideo,
                            animeTitle,
                            seasonNumber,
                            episodeNumber
                    );

            return Map.of(
                    "url", videoUrl,
                    "thumbnailUrl", thumbnailUrl
            );

        } catch (Exception e) {

            // Remove uploaded video if thumbnail generation fails.
            if (videoUrl != null) {
                deleteFile(videoUrl);
            }

            if (e instanceof IOException) {
                throw (IOException) e;
            }

            throw new IOException(
                    "Video upload/thumbnail generation failed",
                    e
            );

        } finally {
            Files.deleteIfExists(tempVideo);
        }
    }
    
    private String generateEpisodeThumbnailFromFile(
            Path videoFile,
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber) throws IOException {

        try (
                FFmpegFrameGrabber grabber =
                        new FFmpegFrameGrabber(videoFile.toFile());

                Java2DFrameConverter converter =
                        new Java2DFrameConverter()
        ) {

        	grabber.setVideoDisposition(1);
        	grabber.start();

        	grabber.setVideoTimestamp(5_000_000L);

        	Frame frame = null;

        	int videoWidth = grabber.getImageWidth();
        	int videoHeight = grabber.getImageHeight();

        	for (int i = 0; i < 30; i++) {

        	    Frame candidate = grabber.grabImage();

        	    if (candidate == null || candidate.image == null) {
        	        continue;
        	    }

        	    // Ignore embedded cover/artwork.
        	    // Keep only a frame matching the actual video stream.
        	    if (candidate.imageWidth == videoWidth
        	            && candidate.imageHeight == videoHeight) {

        	        frame = candidate;
        	        break;
        	    }
        	}

        	if (frame == null) {
        	    throw new IOException(
        	            "Could not extract actual video frame at 4 seconds"
        	    );
        	}

            if (frame == null || frame.image == null) {
                throw new IOException(
                        "Could not extract video frame at 5 seconds"
                );
            }

            BufferedImage image =
                    converter.convert(frame);

            if (image == null) {
                throw new IOException(
                        "Could not convert video frame to image"
                );
            }

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            ImageIO.write(
                    image,
                    "jpg",
                    output
            );

            String thumbnailKey = String.format(
                    "animehub/%s/Season-%d/Episode-%d-Thumbnail-%d.jpg",
                    animeTitle,
                    seasonNumber,
                    episodeNumber,
                    System.currentTimeMillis()
            );

            PutObjectRequest putRequest =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(thumbnailKey)
                            .contentType("image/jpeg")
                            .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromBytes(
                            output.toByteArray()
                    )
            );

            return String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    region,
                    thumbnailKey
            );
        }
    }
}