package com.project.ComplaintApp.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalComplaints;
    private long submittedComplaints;
    private long assignedComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;

    private List<ComplaintResponse> recentComplaints; 
}
