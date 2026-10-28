package com.project.ComplaintApp.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;

    private Boolean isOverdue;
    private Integer slaHours;
    private String adminRemarks;

    // Student Information
    private Long userId;
    private String studentName;
    private String studentEmail;
    private String studentDepartment;
    private String studentDivision;

    public static ComplaintResponse fromEntity(Complaint complaint) {
        ComplaintResponse res = new ComplaintResponse();
        res.setId(complaint.getId());
        res.setTitle(complaint.getTitle());
        res.setDescription(complaint.getDescription());
        res.setCategory(complaint.getCategory().getName());
        res.setPriority(complaint.getPriority().name());
        res.setStatus(complaint.getStatus().name());
        res.setCreatedAt(complaint.getCreatedAt());
        res.setUpdatedAt(complaint.getUpdatedAt());
        res.setImageUrl(complaint.getImagePath());
        res.setDeadline(complaint.getDeadline());
        res.setAdminRemarks(complaint.getAdminRemarks());

        boolean overdue = complaint.getDeadline() != null
                && complaint.getStatus() != com.project.ComplaintApp.Enums.ComplaintStatus.RESOLVED
                && complaint.getStatus() != com.project.ComplaintApp.Enums.ComplaintStatus.REJECTED
                && LocalDateTime.now(ZoneId.of("Asia/Kolkata")).isAfter(complaint.getDeadline());
        res.setIsOverdue(overdue);

        if (complaint.getPriority() != null) {
            res.setSlaHours(switch (complaint.getPriority()) {
                case HIGH -> 12;
                case MEDIUM -> 24;
                case LOW -> 48;
            });
        }

        if (complaint.getUser() != null) {
            res.setUserId(complaint.getUser().getId());
            res.setStudentName(complaint.getUser().getName());
            res.setStudentEmail(complaint.getUser().getEmail());
            res.setStudentDepartment(complaint.getUser().getDepartment());
            res.setStudentDivision(complaint.getUser().getDivision());
        }
        return res;
    }

    public static ComplaintResponse fromEntityForAdmin(Complaint complaint) {
        ComplaintResponse res = fromEntity(complaint);
        // Anonymize submitter identity completely for Admin view
        res.setUserId(null);
        res.setStudentName("Anonymous Student");
        res.setStudentEmail(null);
        res.setStudentDivision(null);
        return res;
    }
}
