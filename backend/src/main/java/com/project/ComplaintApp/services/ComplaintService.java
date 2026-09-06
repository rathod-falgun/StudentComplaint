package com.project.ComplaintApp.services;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.dto.ComplaintRequest;
import com.project.ComplaintApp.dto.ComplaintResponse;
import com.project.ComplaintApp.entities.Category;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.ComplaintRepository;
import com.project.ComplaintApp.repository.CategoryRepository;
import com.project.ComplaintApp.repository.UserRepository;

import jakarta.persistence.criteria.Path;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public ComplaintResponse submitComplaint(Long userId, ComplaintRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Invalid Category"));

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setDescription(req.getDescription());
        complaint.setTitle(req.getTitle());
        complaint.setCategory(category);
        if (req.getPriority() != null) {
            complaint.setPriority(req.getPriority());
        }

        MultipartFile image = req.getImageFile();
        if (image != null && !image.isEmpty()) {

            String uploadDir = System.getProperty("user.dir") + "/uploads/complaints/";
            File dir = new File(uploadDir);
            try {
                if (!dir.exists())
                    dir.mkdirs();

                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                String path = uploadDir + fileName;
                image.transferTo(new File(path));
                complaint.setImagePath(fileName);
                System.out.println("Image is saved into complaint");
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to save Images");
            }
        }
        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    public List<ComplaintResponse> getMyComplaints(Long userId) {
        List<Complaint> complaints = complaintRepository.findByUserId(userId);

        List<ComplaintResponse> response = new ArrayList<>();
        for (Complaint c : complaints) {
            response.add(ComplaintResponse.fromEntity(c));
        }
        return response;
    }
}
