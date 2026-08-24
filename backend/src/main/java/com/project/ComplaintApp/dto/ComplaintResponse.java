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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ComplaintResponse fromEntity(Complaint complaint){
        ComplaintResponse res = new ComplaintResponse();
        res.setId(complaint.getId());
        res.setTitle(complaint.getTitle());
        res.setDescription(complaint.getDescription());
        res.setCategory(complaint.getCategory().getName());
        res.setPriority(complaint.getPriority().name());
        res.setStatus(complaint.getStatus().name());
        res.setCreatedAt(complaint.getCreatedAt());
        res.setUpdatedAt(complaint.getUpdatedAt());
        return res;
    }
}
