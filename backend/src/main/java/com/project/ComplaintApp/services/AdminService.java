package com.project.ComplaintApp.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.ComplaintApp.Enums.ComplaintStatus;
import com.project.ComplaintApp.dto.AdminDashboardResponse;
import com.project.ComplaintApp.dto.ComplaintResponse;
import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.repository.ComplaintRepository;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;


    public AdminService(ComplaintRepository complaintRepository ) {
        this.complaintRepository = complaintRepository;
    }

    public AdminDashboardResponse getDashboardStats() {
        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);

        List<Complaint> recentComplaints = complaintRepository.findTop5ByOrderByCreatedAtDesc();

        List<ComplaintResponse> finalComplaints = new ArrayList<>();
        for (Complaint c : recentComplaints) {
            finalComplaints.add(ComplaintResponse.fromEntity(c));
        }

        return new AdminDashboardResponse(total, submitted, assigned, inProgress, resolved, finalComplaints);
    }

    public Page<ComplaintResponse> getComplaints(Pageable pageable) {
        Page<Complaint> complaints = complaintRepository.findAll(pageable);
        return complaints.map(ComplaintResponse::fromEntity);
    }

    public List<ComplaintResponse> getAllComplaints(){
       List<Complaint> complaints =  complaintRepository.findAll();
        return complaints.stream().map(ComplaintResponse::fromEntity).collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus newStatus) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        ComplaintStatus currentStatus = complaint.getStatus();

        System.out.println("Current Status: " + currentStatus);
        System.out.println("Requested Status: " + newStatus);

        boolean validTransition = switch (currentStatus) {
            case SUBMITTED -> newStatus == ComplaintStatus.ASSIGNED;
            case ASSIGNED -> newStatus == ComplaintStatus.IN_PROGRESS;
            case IN_PROGRESS -> newStatus == ComplaintStatus.RESOLVED;
            case RESOLVED -> false;
        };
        System.out.println("Valid Transition: " + validTransition);

        if (!validTransition) {
            throw new IllegalStateException("Invalid State Transition : " + currentStatus + "->" + newStatus);
        }
        complaint.setStatus(newStatus);
        System.out.println("New Status Before Save: " + complaint.getStatus());

        Complaint updated = complaintRepository.save(complaint);
        System.out.println("New Status After Save: " + updated.getStatus());

        return ComplaintResponse.fromEntity(updated);
    }
}
