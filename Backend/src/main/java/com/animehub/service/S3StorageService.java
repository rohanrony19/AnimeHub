package com.animehub.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;
    
    @Value("${AWS_REGION}")
    private String region;

    public String uploadImage(MultipartFile file, String folder, String fileName) throws IOException {

        String key = "animehub/" + folder + "/" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromBytes(file.getBytes())
        );

        return String.format(
                "https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key	
        );
    }
    
    public String uploadTrailer(MultipartFile file, String animeTitle) throws IOException {

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

        s3Client.putObject(
                request,
                RequestBody.fromBytes(file.getBytes())
        );

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

        s3Client.putObject(
                request,
                RequestBody.fromBytes(file.getBytes())
        );

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
}