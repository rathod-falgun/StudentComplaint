package com.project.ComplaintApp.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.project.ComplaintApp.dto.ComplaintRequest;
import com.project.ComplaintApp.entities.Category;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.ComplaintRepository;
import com.project.ComplaintApp.repository.CategoryRepository;
import com.project.ComplaintApp.repository.UserRepository;

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

    public Complaint submitComplaint(Long userId, ComplaintRequest req) {
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
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getMyComplaints(Long userId) {
        return complaintRepository.findByUserId(userId);
    }
}
