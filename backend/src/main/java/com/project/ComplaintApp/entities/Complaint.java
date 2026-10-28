package com.project.ComplaintApp.entities;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.project.ComplaintApp.Enums.ComplaintPriority;
import com.project.ComplaintApp.Enums.ComplaintStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "complaints")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student who submitted the complaint
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Category of the complaint
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "deadline_missed_email_sent")
    private Boolean deadlineMissedEmailSent;

    @Column(name = "admin_remarks", columnDefinition = "TEXT")
    private String adminRemarks;

    public static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(IST_ZONE);
        updatedAt = LocalDateTime.now(IST_ZONE);
        if (priority == null)
            priority = ComplaintPriority.MEDIUM;
        if (status == null)
            status = ComplaintStatus.SUBMITTED;
        if (deadlineMissedEmailSent == null)
            deadlineMissedEmailSent = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(IST_ZONE);
    }
}