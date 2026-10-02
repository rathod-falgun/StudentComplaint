package com.project.ComplaintApp.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public class AuthorizationUtil {

    public static void checkUserAccess(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("========== AUTHORIZATION CHECK ==========");
        System.out.println("Requested User ID: " + userId);
        System.out.println("Authentication: " + authentication);

        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("Authentication is missing or not authenticated");
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not authenticated");
        }

        System.out.println("Authentication Name: " + authentication.getName());
        System.out.println("Authorities: " + authentication.getAuthorities());

        Long loggedInUserId;

        try {
            loggedInUserId = Long.valueOf(authentication.getName());
        } catch (NumberFormatException e) {
            System.out.println("Authentication name is not a valid user ID");
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid authenticated user");
        }

        System.out.println("Logged In User ID: " + loggedInUserId);

        if (!loggedInUserId.equals(userId)) {
            System.out.println("USER ID MISMATCH");
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to access this resource");
        }

        System.out.println("USER ID MATCHED");
        System.out.println("==========================================");
    }
}