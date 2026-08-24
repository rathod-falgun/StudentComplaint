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
    private String role;
    private LocalDate createdAt;

    public static UserResponse fromEntity(User user) {
        UserResponse u = new UserResponse();
        u.setId(user.getId());
        u.setName(user.getName());
        u.setEmail(user.getEmail());
        u.setDepartment(user.getDepartment());
        u.setRole(user.getRole().name());
        u.setCreatedAt(user.getCreatedAt().toLocalDate());
        return u;
    }
}
