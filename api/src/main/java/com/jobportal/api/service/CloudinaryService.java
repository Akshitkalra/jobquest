package com.jobportal.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.jobportal.api.exception.FileUploadException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Nullable Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        if (cloudinary == null) {
            log.warn("Cloudinary is not configured. File uploads will be saved locally as a fallback.");
        }
    }

    /**
     * Upload a file to Cloudinary.
     * If Cloudinary is not configured, saves to a local temp directory and returns a placeholder URL.
     *
     * @param file   the multipart file to upload
     * @param folder the Cloudinary folder to upload into (e.g., "resumes", "avatars")
     * @return UploadResult containing the URL and public ID
     */
    @SuppressWarnings("unchecked")
    public UploadResult uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File is empty or null");
        }

        if (cloudinary != null) {
            return uploadToCloudinary(file, folder);
        } else {
            return saveToLocalFallback(file, folder);
        }
    }

    /**
     * Delete a file from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public ID of the file
     */
    @SuppressWarnings("unchecked")
    public void deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            log.warn("Attempted to delete file with null or blank publicId");
            return;
        }

        if (cloudinary == null) {
            log.info("Cloudinary not configured - skipping delete for publicId: {}", publicId);
            return;
        }

        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");

            if ("ok".equals(resultStatus)) {
                log.info("Successfully deleted file from Cloudinary: {}", publicId);
            } else {
                log.warn("Cloudinary delete returned status '{}' for publicId: {}", resultStatus, publicId);
            }
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary (publicId: {}): {}", publicId, e.getMessage(), e);
            throw new FileUploadException("Failed to delete file from Cloudinary: " + publicId);
        }
    }

    @SuppressWarnings("unchecked")
    private UploadResult uploadToCloudinary(MultipartFile file, String folder) {
        try {
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
            );

            Map<String, Object> uploadResponse = cloudinary.uploader().upload(file.getBytes(), params);

            String url = (String) uploadResponse.get("secure_url");
            if (url == null) {
                url = (String) uploadResponse.get("url");
            }
            String publicId = (String) uploadResponse.get("public_id");

            log.info("File uploaded to Cloudinary: folder={}, publicId={}", folder, publicId);

            return UploadResult.builder()
                    .url(url)
                    .publicId(publicId)
                    .build();
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new FileUploadException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    private UploadResult saveToLocalFallback(MultipartFile file, String folder) {
        try {
            Path tempDir = Files.createDirectories(Path.of(System.getProperty("java.io.tmpdir"),
                    "jobportal-uploads", folder));
            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = tempDir.resolve(uniqueFileName);

            file.transferTo(filePath.toFile());

            String placeholderUrl = "file://" + filePath.toAbsolutePath();
            String publicId = folder + "/" + uniqueFileName;

            log.info("File saved locally (Cloudinary not configured): {}", filePath);

            return UploadResult.builder()
                    .url(placeholderUrl)
                    .publicId(publicId)
                    .build();
        } catch (IOException e) {
            log.error("Failed to save file locally: {}", e.getMessage(), e);
            throw new FileUploadException("Failed to save file: " + e.getMessage());
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadResult {
        private String url;
        private String publicId;
    }
}
