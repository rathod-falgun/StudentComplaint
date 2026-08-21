package com.project.ComplaintApp.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.services.AuthService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req, HttpServletRequest request) {
        try {
            System.out.println("========== REGISTER REQUEST RECEIVED ==========");
            System.out.println("Name: " + req.getName());
            System.out.println("Email: " + req.getEmail());
            System.out.println("===============================================");
            String result = authService.register(req);

            return ResponseEntity.ok(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Map<String, String> result = authService.login(req);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}
