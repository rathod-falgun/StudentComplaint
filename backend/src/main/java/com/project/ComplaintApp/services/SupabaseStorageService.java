package com.project.ComplaintApp.services;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.config.SupabaseStorageProperties;

/**
 * Handles file uploads and deletions against the Supabase Storage REST API.
 * Uses Spring's RestClient (available in Spring Boot 3.2+ / 4.x).
 */
@Service
public class SupabaseStorageService {

    private final SupabaseStorageProperties props;
    private final RestClient restClient;

    public SupabaseStorageService(SupabaseStorageProperties props) {
        this.props = props;
        this.restClient = RestClient.create();
    }

    /**
     * Uploads a MultipartFile to a Supabase Storage bucket.
     *
     * @param bucket bucket name, e.g. "profiles" or "complaints"
     * @param path   object path inside the bucket, e.g. "user_42/avatar.jpg"
     * @param file   the file coming from a multipart request
     * @return the public URL of the uploaded object
     */
    public String uploadFile(String bucket, String path, MultipartFile file) {
        try {
            String baseUrl = normalizeBaseUrl(props.getUrl());
            String uploadUrl = baseUrl + "/storage/v1/object/" + bucket + "/" + path;

            restClient.post()
                    .uri(java.net.URI.create(uploadUrl))
                    .header("apikey", props.getServiceRoleKey())
                    .header("Authorization", "Bearer " + props.getServiceRoleKey())
                    .header("Content-Type", resolveContentType(file))
                    .header("x-upsert", "true") // overwrite if the same path is re-uploaded
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();

            // Return the standard Supabase public-object URL
            return baseUrl + "/storage/v1/object/public/" + bucket + "/" + path;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Supabase Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a file from Supabase Storage.
     *
     * @param bucket bucket name
     * @param path   object path inside the bucket
     */
    public void deleteFile(String bucket, String path) {
        String baseUrl = normalizeBaseUrl(props.getUrl());
        String deleteUrl = baseUrl + "/storage/v1/object/" + bucket + "/" + path;

        restClient.delete()
                .uri(java.net.URI.create(deleteUrl))
                .header("apikey", props.getServiceRoleKey())
                .header("Authorization", "Bearer " + props.getServiceRoleKey())
                .retrieve()
                .toBodilessEntity();
    }

    /**
     * Extracts file extension from the original filename.
     *
     * @param originalFilename e.g. "photo.png"
     * @return extension without dot, e.g. "png", defaults to "jpg"
     */
    public static String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "jpg";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private String resolveContentType(MultipartFile file) {
        String ct = file.getContentType();
        return (ct != null && !ct.isBlank()) ? ct : "application/octet-stream";
    }

    private String normalizeBaseUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalStateException(
                    "Supabase URL is not configured. Please set app.supabase.url in application.yml.");
        }
        String clean = rawUrl.trim().replaceAll("/+$", "");
        if (clean.endsWith("/rest/v1")) {
            clean = clean.substring(0, clean.length() - "/rest/v1".length());
        }
        return clean.replaceAll("/+$", "");
    }
}
