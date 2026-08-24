package com.project.ComplaintApp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.ComplaintApp.dto.UserResponse;
import com.project.ComplaintApp.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("api/users")
public class UserContoller {

    private final UserRepository userRepository;

    public UserContoller(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping("/getProfile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElse(ResponseEntity.status(404).build());
    }
}
