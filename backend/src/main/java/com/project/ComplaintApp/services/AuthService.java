package com.project.ComplaintApp.services;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.project.ComplaintApp.Enums.Role;
import com.project.ComplaintApp.config.JwtUtil;
import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.entities.EmailOtp;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.EmailOtpRepository;
import com.project.ComplaintApp.repository.UserRepository;

@Service
public class AuthService {

    @Value("${app.college.allowed-email-domain:scet.ac.in}")
    private String allowedEmailDomain;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            EmailOtpRepository emailOtpRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
    }

    /**
     * Sends a 6-digit verification code to the student's official college email address.
     */
    public String sendOtp(String email) {
        String normalizedEmail = normalizeAndValidateCollegeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email '" + normalizedEmail + "' is already registered. Please login instead.");
        }

        // Generate secure 6-digit OTP
        int randomCode = 100000 + new java.security.SecureRandom().nextInt(900000);
        String otp = String.valueOf(randomCode);

        // Delete any existing unverified OTP for this email
        try {
            emailOtpRepository.deleteByEmail(normalizedEmail);
        } catch (Exception ignored) {}

        // Save new OTP record (valid for 5 minutes)
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(normalizedEmail);
        emailOtp.setOtp(otp);
        emailOtp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(5));
        emailOtp.setVerified(false);
        emailOtpRepository.save(emailOtp);

        // Send email (and log to console for development)
        emailService.sendOtpEmail(normalizedEmail, otp);

        return "Verification code sent to " + normalizedEmail;
    }

    /**
     * Normalizes and validates that the email address is well-formed and belongs strictly to the official college domain.
     */
    public String normalizeAndValidateCollegeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Official college email address is required.");
        }

        String normalized = email.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid email format. Please enter a valid email address.");
        }

        int atIndex = normalized.lastIndexOf('@');
        if (atIndex <= 0 || atIndex >= normalized.length() - 1) {
            throw new IllegalArgumentException("Invalid email structure.");
        }

        String domain = normalized.substring(atIndex + 1);
        String expectedDomain = (allowedEmailDomain != null ? allowedEmailDomain.trim().toLowerCase() : "scet.ac.in");

        if (!domain.equals(expectedDomain)) {
            throw new IllegalArgumentException(
                "Only official college email addresses (@" + expectedDomain + ") are allowed for student registration."
            );
        }

        return normalized;
    }

    public String register(RegisterRequest req, MultipartFile profilePhoto) throws IOException {
        if (req == null) {
            throw new IllegalArgumentException("Registration details must not be null.");
        }

        // Validate required fields
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }

        if (req.getDepartment() == null || req.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required.");
        }

        if (req.getDivision() == null || req.getDivision().trim().isEmpty()) {
            throw new IllegalArgumentException("Division is required.");
        }

        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        // Normalize and strictly validate official college email domain
        String normalizedEmail = normalizeAndValidateCollegeEmail(req.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email '" + normalizedEmail + "' is already registered.");
        }

        // Validate OTP verification code
        if (req.getOtp() == null || req.getOtp().trim().isEmpty()) {
            throw new IllegalArgumentException("Email verification code (OTP) is required. Please verify your email first.");
        }

        String inputOtp = req.getOtp().trim();
        EmailOtp otpRecord = emailOtpRepository
                .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No pending verification code found for '" + normalizedEmail + "'. Please tap 'Send OTP' first."));

        if (otpRecord.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("The verification code has expired. Please request a new OTP.");
        }

        if (!otpRecord.getOtp().equals(inputOtp)) {
            throw new IllegalArgumentException("Incorrect verification code. Please check your email and try again.");
        }

        // Mark OTP as verified
        otpRecord.setVerified(true);
        emailOtpRepository.save(otpRecord);

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(encoder.encode(req.getPassword()));
        user.setDepartment(req.getDepartment().trim());
        user.setDivision(req.getDivision().trim());
        // Always assign STUDENT role on the server; client cannot assign or override role
        user.setRole(Role.STUDENT);

        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + "/uploads/profiles/";
            File dir = new File(uploadDir);

            try {
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String fileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
                String path = uploadDir + fileName;
                profilePhoto.transferTo(new File(path));
                user.setProfilePhotoPath(fileName);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to save profile image: " + e.getMessage());
            }
        }

        userRepository.save(user);
        return "Registered Successfully";
    }

    public Map<String, Object> login(LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            throw new RuntimeException("Password is required.");
        }

        String rawEmail = req.getEmail().trim();
        String normalizedEmail = rawEmail.toLowerCase();

        // Search for normalized email first; fallback to raw email for backward compatibility with existing users
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> userRepository.findByEmail(rawEmail)
                .orElseThrow(() -> new RuntimeException("Email '" + rawEmail + "' is not registered in database.")));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password for account '" + rawEmail + "'.");
        }

        String generatedToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login Successful");
        response.put("token", generatedToken);
        response.put("name", user.getName());
        response.put("userId", String.valueOf(user.getId()));
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }
}

