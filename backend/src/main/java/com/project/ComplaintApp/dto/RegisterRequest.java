package com.project.ComplaintApp.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String department;
    private String division;
    private String otp;
}
