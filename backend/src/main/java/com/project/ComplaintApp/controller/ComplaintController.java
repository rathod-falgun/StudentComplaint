package com.project.ComplaintApp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.ComplaintApp.dto.ComplaintRequest;
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

    @PostMapping("/{userId}")
    public ResponseEntity<?> submit(@PathVariable Long userId, @RequestBody ComplaintRequest req) {
        Complaint complaint = complaintService.submitComplaint(userId, req);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> myComplaints(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.getMyComplaints(userId));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());

    }
}
