package com.project.ComplaintApp.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.Enums.ComplaintPriority;
import com.project.ComplaintApp.config.AuthorizationUtil;
import com.project.ComplaintApp.config.SupabaseStorageProperties;
import com.project.ComplaintApp.dto.ComplaintRequest;
import com.project.ComplaintApp.dto.ComplaintResponse;
import com.project.ComplaintApp.entities.Category;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.CategoryRepository;
import com.project.ComplaintApp.repository.ComplaintRepository;
import com.project.ComplaintApp.repository.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final SupabaseStorageProperties supabaseProps;
    private final WorkingHoursDeadlineService workingHoursDeadlineService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            SupabaseStorageService supabaseStorageService,
            SupabaseStorageProperties supabaseProps,
            WorkingHoursDeadlineService workingHoursDeadlineService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.supabaseProps = supabaseProps;
        this.workingHoursDeadlineService = workingHoursDeadlineService;
    }

    public ComplaintResponse submitComplaint(Long userId, ComplaintRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Category"));

        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint title is required.");
        }
        if (req.getDescription() == null || req.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Complaint description is required.");
        }

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setTitle(req.getTitle().trim());
        complaint.setDescription(req.getDescription().trim());
        complaint.setCategory(category);
        complaint.setStatus(com.project.ComplaintApp.Enums.ComplaintStatus.SUBMITTED);

        ComplaintPriority priority = req.getPriority() != null ? req.getPriority() : ComplaintPriority.MEDIUM;
        complaint.setPriority(priority);

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        complaint.setCreatedAt(now);
        complaint.setUpdatedAt(now);

        // Compute deadline based on college working hours (LOW: 48h, MEDIUM: 24h, HIGH: 12h)
        LocalDateTime deadline = workingHoursDeadlineService.calculateDeadline(now, priority);
        complaint.setDeadline(deadline);
        complaint.setDeadlineMissedEmailSent(false);

        // Upload complaint image to Supabase Storage
        MultipartFile image = req.getImageFile();
        if (image != null && !image.isEmpty()) {
            String ext = SupabaseStorageService.getExtension(image.getOriginalFilename());
            // Path inside bucket: complaint_<timestamp>.<ext>
            String objectPath = "complaint_" + System.currentTimeMillis() + "." + ext;
            String publicUrl = supabaseStorageService.uploadFile(
                    supabaseProps.getBuckets().getComplaints(), objectPath, image);
            complaint.setImagePath(publicUrl); // store full public URL
        }

        Complaint saved = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(saved);
    }

    public List<ComplaintResponse> getMyComplaints(Long userId) {
        AuthorizationUtil.checkUserAccess(userId);
        List<Complaint> complaints = complaintRepository.findbyUserIdOrederByCreatedAtAndStatus(userId);

        List<ComplaintResponse> response = new ArrayList<>();
        for (Complaint c : complaints) {
            response.add(ComplaintResponse.fromEntity(c));
        }
        return response;
    }
}
