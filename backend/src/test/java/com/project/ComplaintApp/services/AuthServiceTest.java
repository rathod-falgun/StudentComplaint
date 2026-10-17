package com.project.ComplaintApp.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.project.ComplaintApp.Enums.Role;
import com.project.ComplaintApp.config.JwtUtil;
import com.project.ComplaintApp.dto.LoginRequest;
import com.project.ComplaintApp.dto.RegisterRequest;
import com.project.ComplaintApp.entities.EmailOtp;
import com.project.ComplaintApp.entities.User;
import com.project.ComplaintApp.repository.EmailOtpRepository;
import com.project.ComplaintApp.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailOtpRepository emailOtpRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() throws Exception {
        // Inject allowedEmailDomain via reflection
        Field field = AuthService.class.getDeclaredField("allowedEmailDomain");
        field.setAccessible(true);
        field.set(authService, "scet.ac.in");
    }

    private EmailOtp createActiveOtp(String email, String code) {
        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setOtp(code);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setVerified(false);
        return otp;
    }

    @Test
    @DisplayName("1. Send OTP to valid @scet.ac.in email succeeds")
    void testSendOtpSuccess() {
        String email = "arjun.co23b1@scet.ac.in";
        when(userRepository.existsByEmail(email)).thenReturn(false);

        String result = authService.sendOtp(email);

        assertTrue(result.contains("Verification code sent"));
        verify(emailOtpRepository).save(any(EmailOtp.class));
        verify(emailService).sendOtpEmail(eq(email), anyString());
    }

    @Test
    @DisplayName("2. Send OTP rejects non-scet email")
    void testSendOtpRejectsNonScetEmail() {
        String email = "student@gmail.com";

        assertThrows(IllegalArgumentException.class, () -> authService.sendOtp(email));
        verify(emailOtpRepository, never()).save(any());
        verify(emailService, never()).sendOtpEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("3. Valid @scet.ac.in registration with correct OTP succeeds and assigns STUDENT role")
    void testValidRegistrationWithOtp() throws IOException {
        String email = "arjun.co23b1@scet.ac.in";
        RegisterRequest req = new RegisterRequest();
        req.setName("Arjun Patel");
        req.setEmail(email);
        req.setPassword("password123");
        req.setDepartment("CO");
        req.setDivision("B1");
        req.setOtp("654321");

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(emailOtpRepository.findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email))
                .thenReturn(Optional.of(createActiveOtp(email, "654321")));

        String result = authService.register(req, null);

        assertEquals("Registered Successfully", result);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Arjun Patel", savedUser.getName());
        assertEquals(email, savedUser.getEmail());
        assertEquals("CO", savedUser.getDepartment());
        assertEquals("B1", savedUser.getDivision());
        assertEquals(Role.STUDENT, savedUser.getRole());
    }

    @Test
    @DisplayName("4. Registration without OTP throws exception")
    void testRegistrationMissingOtp() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Arjun Patel");
        req.setEmail("arjun.co23b1@scet.ac.in");
        req.setPassword("password123");
        req.setDepartment("CO");
        req.setDivision("B1");
        req.setOtp(""); // Missing OTP

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(req, null);
        });

        assertTrue(ex.getMessage().contains("OTP"));
    }

    @Test
    @DisplayName("5. Registration with incorrect OTP throws exception")
    void testRegistrationIncorrectOtp() {
        String email = "arjun.co23b1@scet.ac.in";
        RegisterRequest req = new RegisterRequest();
        req.setName("Arjun Patel");
        req.setEmail(email);
        req.setPassword("password123");
        req.setDepartment("CO");
        req.setDivision("B1");
        req.setOtp("999999"); // Wrong code

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(emailOtpRepository.findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email))
                .thenReturn(Optional.of(createActiveOtp(email, "123456")));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(req, null);
        });

        assertTrue(ex.getMessage().contains("Incorrect verification code"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("6. Registration with expired OTP throws exception")
    void testRegistrationExpiredOtp() {
        String email = "arjun.co23b1@scet.ac.in";
        RegisterRequest req = new RegisterRequest();
        req.setName("Arjun Patel");
        req.setEmail(email);
        req.setPassword("password123");
        req.setDepartment("CO");
        req.setDivision("B1");
        req.setOtp("123456");

        EmailOtp expiredOtp = new EmailOtp();
        expiredOtp.setEmail(email);
        expiredOtp.setOtp("123456");
        expiredOtp.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // Expired
        expiredOtp.setVerified(false);

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(emailOtpRepository.findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email))
                .thenReturn(Optional.of(expiredOtp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(req, null);
        });

        assertTrue(ex.getMessage().contains("expired"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("7. Reject gmail.com address")
    void testRejectGmailAddress() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Student");
        req.setEmail("student@gmail.com");
        req.setPassword("password123");
        req.setDepartment("IT");
        req.setDivision("A");
        req.setOtp("123456");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(req, null);
        });

        assertTrue(ex.getMessage().contains("scet.ac.in"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("8. Duplicate email registration rejected")
    void testDuplicateEmailRegistrationRejected() {
        String email = "duplicate@scet.ac.in";
        RegisterRequest req = new RegisterRequest();
        req.setName("Duplicate User");
        req.setEmail(email);
        req.setPassword("password123");
        req.setDepartment("CO");
        req.setDivision("B");
        req.setOtp("123456");

        when(userRepository.existsByEmail(email)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(req, null);
        });

        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("9. Successful login with normalized email")
    void testLoginWithNormalizedEmail() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = new User();
        user.setId(10L);
        user.setName("Arjun");
        user.setEmail("arjun.co23b1@scet.ac.in");
        user.setPassword(encoder.encode("password123"));
        user.setRole(Role.STUDENT);

        when(userRepository.findByEmail("arjun.co23b1@scet.ac.in")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(10L, "arjun.co23b1@scet.ac.in", "STUDENT")).thenReturn("mock-jwt-token");

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("  ARJUN.CO23B1@SCET.AC.IN  ");
        loginReq.setPassword("password123");

        var response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("Login Successful", response.get("message"));
        assertEquals("mock-jwt-token", response.get("token"));
        assertEquals("10", response.get("userId"));
        assertEquals(Role.STUDENT, response.get("role"));
    }

    @Test
    @DisplayName("10. Login with incorrect password throws exception")
    void testLoginWithIncorrectPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = new User();
        user.setId(10L);
        user.setName("Arjun");
        user.setEmail("arjun.co23b1@scet.ac.in");
        user.setPassword(encoder.encode("correctPassword"));
        user.setRole(Role.STUDENT);

        when(userRepository.findByEmail("arjun.co23b1@scet.ac.in")).thenReturn(Optional.of(user));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("arjun.co23b1@scet.ac.in");
        loginReq.setPassword("wrongPassword");

        assertThrows(RuntimeException.class, () -> authService.login(loginReq));
    }
}
