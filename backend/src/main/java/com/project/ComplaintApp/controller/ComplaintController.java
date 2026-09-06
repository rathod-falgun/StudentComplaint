package com.project.ComplaintApp.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.dto.ComplaintRequest;
import com.project.ComplaintApp.dto.ComplaintResponse;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.repository.CategoryRepository;
import com.project.ComplaintApp.services.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CategoryRepository categoryRepository;

    public ComplaintController(ComplaintService complaintService, CategoryRepository categoryRepository) {
        this.complaintService = complaintService;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submit(@PathVariable Long userId, @ModelAttribute ComplaintRequest complaintRequest) {
        ComplaintResponse complaint = complaintService.submitComplaint(userId, complaintRequest);
        System.out.println("-------------------------------------");
        System.out.println("Title: " + complaintRequest.getTitle());
        System.out.println("Priority Enum: " + complaintRequest.getPriority());
        MultipartFile imageFile = complaintRequest.getImageFile();

        if (imageFile != null && !imageFile.isEmpty()) {
            System.out.println("Image is recieve with file name  " + imageFile.getOriginalFilename());
        } else {
            System.out.println("No Image is recieved");
        }
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/getMyComplaint/{userId}")
    public ResponseEntity<List<ComplaintResponse>> myComplaints(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.getMyComplaints(userId));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());

    }
}
