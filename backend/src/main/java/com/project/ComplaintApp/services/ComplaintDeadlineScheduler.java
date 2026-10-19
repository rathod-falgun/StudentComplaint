package com.project.ComplaintApp.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.project.ComplaintApp.entities.Complaint;
import com.project.ComplaintApp.repository.ComplaintRepository;

@Component
public class ComplaintDeadlineScheduler {

    private final ComplaintRepository complaintRepository;
    private final EmailService emailService;
    private final WorkingHoursDeadlineService workingHoursDeadlineService;

    public ComplaintDeadlineScheduler(
            ComplaintRepository complaintRepository,
            EmailService emailService,
            WorkingHoursDeadlineService workingHoursDeadlineService) {
        this.complaintRepository = complaintRepository;
        this.emailService = emailService;
        this.workingHoursDeadlineService = workingHoursDeadlineService;
    }

    /**
     * Checks for overdue unresolved complaints every minute.
     * When a complaint passes its SLA deadline without resolution,
     * it notifies the student via email and marks the complaint so it's not notified again.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 15000)
    @Transactional
    public void checkOverdueComplaints() {
        LocalDateTime now = LocalDateTime.now();
        List<Complaint> overdueComplaints = complaintRepository.findOverdueUnresolvedComplaints(now);

        if (overdueComplaints.isEmpty()) {
            return;
        }

        System.out.println("⏱️ [SLA Monitor] Found " + overdueComplaints.size()
                + " overdue unresolved complaint(s) requiring breach notification.");

        for (Complaint complaint : overdueComplaints) {
            try {
                if (complaint.getUser() == null || complaint.getUser().getEmail() == null) {
                    System.err.println("Skipping Complaint #" + complaint.getId() + " - User or email is missing.");
                    complaint.setDeadlineMissedEmailSent(true);
                    complaintRepository.save(complaint);
                    continue;
                }

                int slaHours = workingHoursDeadlineService.getSlaWorkingHours(complaint.getPriority());

                boolean sent = emailService.sendDeadlineMissedEmail(
                        complaint.getUser().getEmail(),
                        complaint.getUser().getName(),
                        complaint.getId(),
                        complaint.getTitle(),
                        complaint.getPriority(),
                        complaint.getDeadline(),
                        complaint.getStatus(),
                        slaHours);

                if (sent) {
                    complaint.setDeadlineMissedEmailSent(true);
                    complaintRepository.save(complaint);
                    System.out.println("✅ Marked SLA breach notification sent for Complaint #" + complaint.getId());
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to process SLA notification for Complaint #" + complaint.getId() + ": "
                        + e.getMessage());
            }
        }
    }
}
