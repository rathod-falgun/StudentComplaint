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
    private long rejectedComplaints;

    private List<ComplaintResponse> recentComplaints; 

    public AdminDashboardResponse(long totalComplaints, long submittedComplaints, long assignedComplaints,
            long inProgressComplaints, long resolvedComplaints, List<ComplaintResponse> recentComplaints) {
        this.totalComplaints = totalComplaints;
        this.submittedComplaints = submittedComplaints;
        this.assignedComplaints = assignedComplaints;
        this.inProgressComplaints = inProgressComplaints;
        this.resolvedComplaints = resolvedComplaints;
        this.rejectedComplaints = 0;
        this.recentComplaints = recentComplaints;
    }
}
