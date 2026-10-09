package com.animehub.service;

import java.util.ArrayList; 
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.AbortMultipartUploadRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.io.IOException;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class S3MultipartUploadService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3StorageService s3StorageService;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;

    @Value("${AWS_REGION}")
    private String region;

    private static final long PART_SIZE = 50L * 1024 * 1024;

    public MultipartUploadInitResponse initializeUpload(
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber,
            String originalFileName,
            String contentType,
            long fileSize) {

        String extension = getExtension(originalFileName);

        String key = String.format(
                "animehub/%s/Season-%d/Episode-%d.%s",
                animeTitle,
                seasonNumber,
                episodeNumber,
                extension
        );

        CreateMultipartUploadRequest request =
                CreateMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(contentType)
                        .build();

        CreateMultipartUploadResponse response =
                s3Client.createMultipartUpload(request);

        String uploadId = response.uploadId();

        int totalParts =
                (int) Math.ceil((double) fileSize / PART_SIZE);

        List<PresignedPart> parts = new ArrayList<>();

        for (int partNumber = 1;
             partNumber <= totalParts;
             partNumber++) {

            UploadPartRequest uploadPartRequest =
                    UploadPartRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .uploadId(uploadId)
                            .partNumber(partNumber)
                            .build();

            UploadPartPresignRequest presignRequest =
                    UploadPartPresignRequest.builder()
                            .signatureDuration(Duration.ofHours(2))
                            .uploadPartRequest(uploadPartRequest)
                            .build();

            PresignedUploadPartRequest presigned =
                    s3Presigner.presignUploadPart(presignRequest);

            parts.add(
                    new PresignedPart(
                            partNumber,
                            presigned.url().toString()
                    )
            );
        }

        String videoUrl = String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key
        );

        return new MultipartUploadInitResponse(
                uploadId,
                key,
                videoUrl,
                PART_SIZE,
                totalParts,
                parts
        );
    }
    
    public Map<String, String> completeUpload(
            String uploadId,
            String key,
            List<CompletedPartRequest> parts,
            String animeTitle,
            Integer seasonNumber,
            Integer episodeNumber) throws IOException {

        List<CompletedPart> completedParts =
                parts.stream()
                        .map(part ->
                                CompletedPart.builder()
                                        .partNumber(part.partNumber())
                                        .eTag(part.eTag())
                                        .build()
                        )
                        .toList();

        CompletedMultipartUpload completedUpload =
                CompletedMultipartUpload.builder()
                        .parts(completedParts)
                        .build();

        CompleteMultipartUploadRequest request =
                CompleteMultipartUploadRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .uploadId(uploadId)
                        .multipartUpload(completedUpload)
                        .build();

        s3Client.completeMultipartUpload(request);

        String videoUrl = String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key
        );

        try {

            String thumbnailUrl =
                    s3StorageService.generateEpisodeThumbnailFromUrl(
                            videoUrl,
                            animeTitle,
                            seasonNumber,
                            episodeNumber
                    );

            if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
                throw new IOException(
                        "Thumbnail generation returned empty URL"
                );
            }

            return Map.of(
                    "url", videoUrl,
                    "thumbnailUrl", thumbnailUrl
            );

        } catch (Exception e) {

            // Do not leave a video without a thumbnail.
            try {
                s3StorageService.deleteFile(videoUrl);
            } catch (Exception cleanupException) {
                System.err.println(
                        "Failed to cleanup video after thumbnail failure: "
                                + videoUrl
                );
            }

            if (e instanceof IOException) {
                throw (IOException) e;
            }

            throw new IOException(
                    "Video uploaded but thumbnail generation failed",
                    e
            );
        }
    }

    private String getExtension(String fileName) {

        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(
                fileName.lastIndexOf('.') + 1
        );
    }

    public record MultipartUploadInitResponse(
            String uploadId,
            String key,
            String videoUrl,
            long partSize,
            int totalParts,
            List<PresignedPart> parts
    ) {}

    public record PresignedPart(
            int partNumber,
            String url
    ) {}
    
    public record CompletedPartRequest(
            int partNumber,
            String eTag
    ) {}
}