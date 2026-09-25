package com.project.ComplaintApp.dto;

import java.time.LocalDateTime;

import com.project.ComplaintApp.entities.Complaint;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Student Information
    private Long userId;
    private String studentName;
    private String studentEmail;
    private String studentDepartment;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        ComplaintResponse res = new ComplaintResponse();
        res.setId(complaint.getId());
        res.setTitle(complaint.getTitle());
        res.setDescription(complaint.getDescription());
        res.setCategory(complaint.getCategory() != null ? complaint.getCategory().getName() : "General");
        res.setPriority(complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM");
        res.setStatus(complaint.getStatus() != null ? complaint.getStatus().name() : "PENDING");
        res.setCreatedAt(complaint.getCreatedAt());
        res.setUpdatedAt(complaint.getUpdatedAt());
        res.setImageUrl(complaint.getImagePath());

        if (complaint.getUser() != null) {
            res.setUserId(complaint.getUser().getId());
            res.setStudentName(complaint.getUser().getName());
            res.setStudentEmail(complaint.getUser().getEmail());
            res.setStudentDepartment(complaint.getUser().getDepartment());
        }
        return res;
    }
}
