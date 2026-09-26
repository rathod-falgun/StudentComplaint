package com.project.ComplaintApp.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.ComplaintApp.Enums.Role;
import com.project.ComplaintApp.config.JwtUtil;
import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.UserRepository;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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

    public Map<String, Object> login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email '" + req.getEmail() + "' is not registered in database."));
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password for account '" + req.getEmail() + "'.");
        }
        String generetedToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        System.out.println(generetedToken);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login Successful");
        response.put("token", generetedToken);
        response.put("name", user.getName());
        response.put("userId", String.valueOf(user.getId()));
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }
}
