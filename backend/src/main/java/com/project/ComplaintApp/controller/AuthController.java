package com.project.ComplaintApp.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.dto.ResetPasswordRequest;
import com.project.ComplaintApp.services.AuthService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@ModelAttribute RegisterRequest req, HttpServletRequest request , @RequestPart(value = "profilePhotoFile" , required = false) MultipartFile profilePhoto) {
        System.out.println("========== CONTROLLER START ==========");
         try {
        System.out.println("========== REGISTER REQUEST RECEIVED ==========");
        System.out.println("Name: " + req.getName());
        System.out.println("Email: " + req.getEmail());
        System.out.println("Department: " + req.getDepartment());

       if (profilePhoto == null) {
    System.out.println("Profile Photo is NULL");
} else {
    System.out.println("Profile Photo: " + profilePhoto.getOriginalFilename());
}


        System.out.println("===============================================");
        System.out.println("========== BEFORE SERVICE ==========");

        String result = authService.register(req, profilePhoto);
        System.out.println("========== AFTER SERVICE ==========");

        return ResponseEntity.ok(Map.of("message", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            e.printStackTrace();
            int statusCode = (e.getMessage() != null && e.getMessage().toLowerCase().contains("already registered")) ? 409 : 400;
            return ResponseEntity.status(statusCode).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Registration failed."));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body != null ? body.get("email") : null;
            String message = authService.sendOtp(email);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            int statusCode = (e.getMessage() != null && e.getMessage().toLowerCase().contains("already registered")) ? 409 : 400;
            return ResponseEntity.status(statusCode).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to send OTP."));
        }
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendPasswordResetOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body != null ? body.get("email") : null;
            String message = authService.sendPasswordResetOtp(email);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to send reset code."));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            String message = authService.resetPassword(req);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to reset password."));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            System.out.println("========== LOGIN REQUEST RECEIVED ==========");
            System.out.println("Email: " + (req != null ? req.getEmail() : "null"));

            Map<String, Object> result = authService.login(req);
            System.out.println("LOGIN SUCCESSFUL for: " + req.getEmail());
            System.out.println("=============================================");

            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            System.err.println("LOGIN FAILED for Email: " + (req != null ? req.getEmail() : "null") + " | Reason: " + e.getMessage());
            System.err.println("=============================================");
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage(), "error", e.getMessage()));
        }
    }
}
