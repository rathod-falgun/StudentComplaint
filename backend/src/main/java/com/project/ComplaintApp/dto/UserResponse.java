package com.project.ComplaintApp.dto;

import java.time.LocalDate;

import com.project.ComplaintApp.entities.User;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String division;
    private String role;
    private LocalDate createdAt;
    private String profilePhotoPath;
    private String profilePhoto;

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        UserResponse u = new UserResponse();
        u.setId(user.getId());
        u.setName(user.getName());
        u.setEmail(user.getEmail());
        u.setDepartment(user.getDepartment());
        u.setDivision(user.getDivision());

        if (user.getRole() != null) {
            u.setRole(user.getRole().name());
        }

        if (user.getCreatedAt() != null) {
            u.setCreatedAt(user.getCreatedAt().toLocalDate());
        }

        u.setProfilePhotoPath(user.getProfilePhotoPath());
        u.setProfilePhoto(user.getProfilePhotoPath());
        return u;
    }
}
