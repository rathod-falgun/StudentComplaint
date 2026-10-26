package com.project.ComplaintApp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.config.AuthorizationUtil;
import com.project.ComplaintApp.config.SupabaseStorageProperties;
import com.project.ComplaintApp.dto.UserResponse;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.UserRepository;
import com.project.ComplaintApp.services.SupabaseStorageService;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("api/users")
public class UserContoller {

    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final SupabaseStorageProperties supabaseProps;

    public UserContoller(UserRepository userRepository,
                         SupabaseStorageService supabaseStorageService,
                         SupabaseStorageProperties supabaseProps) {
        this.userRepository = userRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.supabaseProps = supabaseProps;
    }

    @GetMapping("/getProfile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        AuthorizationUtil.checkUserAccess(userId);
        return userRepository.findById(userId).map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping({ "/{userId}/photo", "/updatePhoto/{userId}" })
    public ResponseEntity<?> updateProfilePhoto(
            @PathVariable Long userId,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        AuthorizationUtil.checkUserAccess(userId);

        MultipartFile uploadFile = photo != null ? photo : (profilePhoto != null ? profilePhoto : file);
        if (uploadFile == null || uploadFile.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile photo file is required"));
        }

        return userRepository.findById(userId).map(user -> {
            String ext = SupabaseStorageService.getExtension(uploadFile.getOriginalFilename());
            // Use timestamp to ensure each upload produces a unique URL, busting CDN and device cache
            String objectPath = "user_" + user.getId() + "_" + System.currentTimeMillis() + "." + ext;

            // Delete previous photo from Supabase bucket if one exists
            String oldPhotoUrl = user.getProfilePhotoPath();
            if (oldPhotoUrl != null && !oldPhotoUrl.isBlank()) {
                try {
                    String bucket = supabaseProps.getBuckets().getProfiles();
                    String marker = "/storage/v1/object/public/" + bucket + "/";
                    int idx = oldPhotoUrl.indexOf(marker);
                    if (idx != -1) {
                        String oldPath = oldPhotoUrl.substring(idx + marker.length());
                        // Strip any query params if present
                        if (oldPath.contains("?")) {
                            oldPath = oldPath.substring(0, oldPath.indexOf("?"));
                        }
                        supabaseStorageService.deleteFile(bucket, oldPath);
                    }
                } catch (Exception e) {
                    System.err.println("Could not delete old profile photo: " + e.getMessage());
                }
            }

            String publicUrl = supabaseStorageService.uploadFile(
                    supabaseProps.getBuckets().getProfiles(), objectPath, uploadFile);

            user.setProfilePhotoPath(publicUrl);
            User savedUser = userRepository.save(user);

            return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}

