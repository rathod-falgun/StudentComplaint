package com.project.ComplaintApp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.project.ComplaintApp.Enums.ComplaintPriority;
import com.project.ComplaintApp.Enums.ComplaintStatus;
import com.project.ComplaintApp.dto.ComplaintResponse;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:onboarding@resend.dev}")
    private String resendFromEmail;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@scet.ac.in}")
    private String fromEmail;

    /**
     * Sends the OTP verification email to the student's college email address.
     * Also outputs the OTP to the console so local development/testing is always
     * seamless.
     */

    public boolean sendOtpEmail(String toEmail, String otp) {
        System.out.println("Registration OTP requested for: " + toEmail);

        String htmlMsg = "<div style='font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #E2E8F0;border-radius:12px;background:#FFFFFF;'>"
                + "<div style='text-align:center;margin-bottom:20px;'>"
                + "<h2 style='color:#2563EB;margin:0;font-size:22px;'>Sarvajanik College of Engineering &amp; Technology</h2>"
                + "<p style='color:#64748B;font-size:14px;margin-top:4px;'>Official Student Complaint Portal</p>"
                + "</div>"
                + "<hr style='border:none;border-top:1px solid #E2E8F0;margin:16px 0;'/>"
                + "<p style='font-size:15px;color:#1E293B;'>Hello Student,</p>"
                + "<p style='font-size:14px;color:#334155;line-height:1.5;'>Use this One-Time Password (OTP) to complete your registration:</p>"
                + "<div style='text-align:center;margin:28px 0;'>"
                + "<span style='display:inline-block;font-size:34px;font-weight:800;letter-spacing:8px;color:#1D4ED8;background:#EFF6FF;padding:14px 28px;border-radius:10px;border:2px dashed #93C5FD;'>"
                + escapeHtml(otp)
                + "</span></div>"
                + "<p style='font-size:13px;color:#475569;'>This code is valid for <strong>5 minutes</strong>. If you did not request it, disregard this email.</p>"
                + "<hr style='border:none;border-top:1px solid #E2E8F0;margin:24px 0 12px 0;'/>"
                + "<p style='font-size:11px;color:#94A3B8;text-align:center;'>SCET Complaint Management System • Automated Security Message</p>"
                + "</div>";

        return sendResendEmail(
                toEmail,
                "Student Registration OTP",
                htmlMsg);
    }

    public boolean sendDeadlineMissedEmail(
            String toEmail,
            String studentName,
            Long complaintId,
            String title,
            ComplaintPriority priority,
            java.time.LocalDateTime deadline,
            ComplaintStatus status,
            int slaHours) {

        System.out.println("============================================================");
        System.out.println("⚠️ SLA DEADLINE MISSED EMAIL for Complaint #" + complaintId + " [" + toEmail + "]");
        System.out.println("============================================================");

        if (mailSender == null) {
            System.out.println("ℹ️ JavaMailSender is not configured. Overdue notice simulated for: " + toEmail);
            return true;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(fromEmail, "SCET Complaint Portal");
            helper.setTo(toEmail);
            helper.setSubject("Resolution Update: Complaint #" + complaintId + " Deadline Exceeded");

            String formattedDeadline = deadline != null
                    ? deadline.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                    : "Not specified";

            String greetingName = (studentName != null && !studentName.trim().isEmpty()) ? studentName : "Student";

            String htmlMsg = "<div style='font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;'>"
                    + "<div style='text-align: center; margin-bottom: 20px;'>"
                    + "<h2 style='color: #1E293B; margin: 0; font-size: 20px;'>Sarvajanik College of Engineering & Technology</h2>"
                    + "<p style='color: #64748B; font-size: 13px; margin-top: 4px;'>Official Student Complaint Portal</p>"
                    + "</div>"
                    + "<div style='background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; text-align: center;'>"
                    + "<span style='color: #B45309; font-weight: 700; font-size: 14px;'>⚠️ Resolution Deadline Exceeded (SLA Breach)</span>"
                    + "</div>"
                    + "<p style='font-size: 15px; color: #1E293B;'>Hello <strong>" + escapeHtml(greetingName)
                    + "</strong>,</p>"
                    + "<p style='font-size: 14px; color: #334155; line-height: 1.6;'>"
                    + "We are writing to inform you that your complaint <strong>#" + complaintId
                    + "</strong> was not resolved within the committed priority timeline of <strong>"
                    + slaHours + " college working hours</strong>."
                    + "</p>"
                    + "<p style='font-size: 14px; color: #334155; line-height: 1.6;'>"
                    + "We sincerely apologize for this delay. Your issue has been automatically flagged as overdue, and the college administration has been notified to expedite the resolution."
                    + "</p>"
                    + "<div style='background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;'>"
                    + "<h4 style='margin: 0 0 10px 0; color: #0F172A; font-size: 14px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;'>Complaint Information</h4>"
                    + "<p style='margin: 4px 0; font-size: 13px; color: #475569;'><strong>Title:</strong> "
                    + escapeHtml(title) + "</p>"
                    + "<p style='margin: 4px 0; font-size: 13px; color: #475569;'><strong>Priority:</strong> <span style='color: #DC2626; font-weight: 700;'>"
                    + (priority != null ? priority.name() : "N/A") + "</span> (" + slaHours + " working hours SLA)</p>"
                    + "<p style='margin: 4px 0; font-size: 13px; color: #475569;'><strong>Current Status:</strong> "
                    + (status != null ? status.name() : "N/A") + "</p>"
                    + "<p style='margin: 4px 0; font-size: 13px; color: #475569;'><strong>Target Deadline:</strong> "
                    + formattedDeadline + "</p>"
                    + "</div>"
                    + "<p style='font-size: 13px; color: #475569; line-height: 1.5;'>"
                    + "You can track real-time progress and notes anytime by logging into the SCET Complaint Portal app."
                    + "</p>"
                    + "<hr style='border: none; border-top: 1px solid #E2E8F0; margin: 20px 0 12px 0;'/>"
                    + "<p style='font-size: 11px; color: #94A3B8; text-align: center;'>SCET Complaint Management System • Automated SLA Notification</p>"
                    + "</div>";

            helper.setText(htmlMsg, true);
            mailSender.send(mimeMessage);
            System.out.println("✅ Real SLA overdue notice successfully sent to: " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("⚠️ SMTP email delivery warning for deadline missed: " + e.getMessage());
            return true;
        }
    }

    public boolean sendPasswordResetOtpEmail(String toEmail, String otp) {
        System.out.println("============================================================");
        System.out.println("🔑 PASSWORD RESET OTP CODE FOR [" + toEmail + "]: " + otp);
        System.out.println("============================================================");

        if (mailSender == null) {
            System.out.println("ℹ️ JavaMailSender is not configured. Password reset OTP printed above for testing.");
            return true;
        }

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                helper.setFrom(fromEmail, "Complaint Portal");
                helper.setTo(toEmail);
                helper.setSubject("Password Reset OTP: " + otp);

                String htmlMsg = "<div style='font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;'>"
                        + "<div style='text-align: center; margin-bottom: 20px;'>"
                        + "<h2 style='color: #2563EB; margin: 0; font-size: 22px;'>Sarvajanik College of Engineering & Technology</h2>"
                        + "<p style='color: #64748B; font-size: 14px; margin-top: 4px;'>Student Complaint Portal • Password Reset</p>"
                        + "</div>"
                        + "<hr style='border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;'/>"
                        + "<p style='font-size: 15px; color: #1E293B;'>Hello Student,</p>"
                        + "<p style='font-size: 14px; color: #334155; line-height: 1.5;'>You requested a verification code to reset your password on the SCET Complaint Portal. Use the following One-Time Password (OTP) to choose a new password:</p>"
                        + "<div style='text-align: center; margin: 28px 0;'>"
                        + "<span style='display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #DC2626; background: #FEF2F2; padding: 14px 28px; border-radius: 10px; border: 2px dashed #FCA5A5;'>"
                        + otp + "</span>"
                        + "</div>"
                        + "<p style='font-size: 13px; color: #475569;'>This code is valid for <strong>5 minutes</strong>. If you did not request this, please disregard this email or check your account security.</p>"
                        + "<hr style='border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 12px 0;'/>"
                        + "<p style='font-size: 11px; color: #94A3B8; text-align: center;'>SCET Complaint Management System • Security Verification</p>"
                        + "</div>";

                helper.setText(htmlMsg, true);
                mailSender.send(mimeMessage);
                System.out.println("✅ Real password reset email successfully sent to: " + toEmail);
            } catch (Exception e) {
                System.err.println("⚠️ SMTP email delivery warning for password reset: " + e.getMessage());
            }
        });

        return true;
    }

    private boolean sendResendEmail(String toEmail, String subject, String html) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("Resend email failed: RESEND_API_KEY is missing.");
            return false;
        }

        try {
            String jsonBody = "{"
                    + "\"from\":\"" + jsonEscape(resendFromEmail) + "\","
                    + "\"to\":[\"" + jsonEscape(toEmail) + "\"],"
                    + "\"subject\":\"" + jsonEscape(subject) + "\","
                    + "\"html\":\"" + jsonEscape(html) + "\""
                    + "}";

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("Email accepted by Resend for: " + toEmail);
                return true;
            }

            System.err.println("Resend email failed. HTTP status: "
                    + response.statusCode() + ", response: " + response.body());
            return false;

        } catch (Exception e) {
            System.err.println("Resend email request failed: " + e.getMessage());
            return false;
        }
    }

    private String jsonEscape(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder result = new StringBuilder();

        for (char c : value.toCharArray()) {
            switch (c) {
                case '"':
                    result.append("\\\"");
                    break;
                case '\\':
                    result.append("\\\\");
                    break;
                case '\b':
                    result.append("\\b");
                    break;
                case '\f':
                    result.append("\\f");
                    break;
                case '\n':
                    result.append("\\n");
                    break;
                case '\r':
                    result.append("\\r");
                    break;
                case '\t':
                    result.append("\\t");
                    break;
                default:
                    if (c < 0x20) {
                        result.append(String.format("\\u%04x", (int) c));
                    } else {
                        result.append(c);
                    }
            }
        }

        return result.toString();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

}
