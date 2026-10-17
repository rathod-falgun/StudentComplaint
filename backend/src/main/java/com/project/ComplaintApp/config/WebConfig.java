package com.project.ComplaintApp.config;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String userDir = System.getProperty("user.dir");
        Path currentPath = Paths.get(userDir).toAbsolutePath().normalize();

        List<String> complaintLocations = new ArrayList<>();
        List<String> profileLocations = new ArrayList<>();

        // Potential upload root 1: current directory uploads
        addUploadLocations(currentPath.resolve("uploads"), complaintLocations, profileLocations);

        // Potential upload root 2: parent directory uploads (if running from /backend)
        if (currentPath.getParent() != null) {
            addUploadLocations(currentPath.getParent().resolve("uploads"), complaintLocations, profileLocations);
        }

        // Potential upload root 3: subfolder uploads (if running from project root)
        addUploadLocations(currentPath.resolve("backend").resolve("uploads"), complaintLocations, profileLocations);

        registry.addResourceHandler("/uploads/complaints/**")
                .addResourceLocations(complaintLocations.toArray(new String[0]));

        registry.addResourceHandler("/uploads/profiles/**")
                .addResourceLocations(profileLocations.toArray(new String[0]));
    }

    private void addUploadLocations(Path baseUploads, List<String> complaints, List<String> profiles) {
        Path comp = baseUploads.resolve("complaints");
        Path prof = baseUploads.resolve("profiles");

        File compDir = comp.toFile();
        if (!compDir.exists()) {
            compDir.mkdirs();
        }
        String compUri = comp.toUri().toString();
        if (!compUri.endsWith("/")) {
            compUri += "/";
        }
        if (!complaints.contains(compUri)) {
            complaints.add(compUri);
        }

        File profDir = prof.toFile();
        if (!profDir.exists()) {
            profDir.mkdirs();
        }
        String profUri = prof.toUri().toString();
        if (!profUri.endsWith("/")) {
            profUri += "/";
        }
        if (!profiles.contains(profUri)) {
            profiles.add(profUri);
        }
    }
}