package com.project.ComplaintApp.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.ComplaintApp.Enums.Role;
import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email Already Registered");
        } else {
            User user = new User();
            user.setName(req.getName());
            user.setEmail(req.getEmail());
            user.setPassword(encoder.encode(req.getPassword()));
            user.setDepartment(req.getDepartment());
            user.setRole(Role.STUDENT);
            userRepository.save(user);
            return "Registered Successfully";
        }
    }

    public Map<String, String> login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User is not Registered"));
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Login Successful");
        response.put("name", user.getName());
        return response;
    }
}
