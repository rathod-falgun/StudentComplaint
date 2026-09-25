package com.project.ComplaintApp.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.ComplaintApp.Enums.ComplaintStatus;
import com.project.ComplaintApp.dto.AdminDashboardResponse;
import com.project.ComplaintApp.dto.ComplaintResponse;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.repository.ComplaintRepository;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;

    public AdminService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public AdminDashboardResponse getDashboardStats() {
        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus(ComplaintStatus.PENDING);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);

        return new AdminDashboardResponse(total, pending, inProgress, resolved);
    }

    public List<ComplaintResponse> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return complaints.stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);
        return ComplaintResponse.fromEntity(updated);
    }
}
