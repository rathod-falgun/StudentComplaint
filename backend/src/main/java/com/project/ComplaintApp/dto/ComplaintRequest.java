package com.project.ComplaintApp.dto;

import com.project.ComplaintApp.Enums.ComplaintPriority;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String title;
    private String description;
    private Long categoryId;
    private ComplaintPriority priority;
}
