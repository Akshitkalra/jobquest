package com.jobportal.api.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@jobportal.com}")
    private String fromAddress;

    @Value("${app.mail.from-name:JobQuest}")
    private String fromName;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Async
    public void sendApplicationConfirmation(String toEmail, String candidateName,
                                             String jobTitle, String companyName) {
        String subject = "Application Confirmed — " + jobTitle;
        String body = buildEmailHtml(
                "Application Submitted",
                "<p>Hi " + esc(candidateName) + ",</p>"
                + "<p>Your application for <strong>" + esc(jobTitle) + "</strong> at <strong>"
                + esc(companyName) + "</strong> has been received.</p>"
                + "<p>The company will review your profile and you'll be notified of any status updates.</p>"
                + "<p style='color:#6b7280;font-size:14px;'>Good luck!</p>"
        );
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendStatusUpdate(String toEmail, String candidateName,
                                  String jobTitle, String oldStatus, String newStatus) {
        String subject = "Application Update — " + jobTitle;
        String statusLabel = formatStatus(newStatus);
        String body = buildEmailHtml(
                "Application Status Updated",
                "<p>Hi " + esc(candidateName) + ",</p>"
                + "<p>Your application for <strong>" + esc(jobTitle) + "</strong> has been updated.</p>"
                + "<div style='background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;'>"
                + "<p style='margin:0;color:#6b7280;font-size:13px;'>Previous status</p>"
                + "<p style='margin:4px 0 12px;font-size:15px;'>" + formatStatus(oldStatus) + "</p>"
                + "<p style='margin:0;color:#6b7280;font-size:13px;'>New status</p>"
                + "<p style='margin:4px 0 0;font-size:15px;font-weight:600;color:#3b82f6;'>" + statusLabel + "</p>"
                + "</div>"
                + "<p>Log in to your dashboard to view full details.</p>"
        );
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendNewApplicantNotification(String toEmail, String companyName,
                                              String candidateName, String jobTitle,
                                              BigDecimal similarityScore) {
        String scoreText = "N/A";
        if (similarityScore != null) {
            BigDecimal pct = similarityScore.compareTo(BigDecimal.ONE) > 0
                    ? similarityScore
                    : similarityScore.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP);
            scoreText = pct + "%";
        }

        String subject = "New Applicant for " + jobTitle;
        String body = buildEmailHtml(
                "New Application Received",
                "<p>Hi " + esc(companyName) + " Team,</p>"
                + "<p>A new candidate has applied for <strong>" + esc(jobTitle) + "</strong>.</p>"
                + "<div style='background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;'>"
                + "<p style='margin:0 0 8px;'><strong>Candidate:</strong> " + esc(candidateName) + "</p>"
                + "<p style='margin:0;'><strong>AI Match Score:</strong> "
                + "<span style='color:#3b82f6;font-weight:600;'>" + scoreText + "</span></p>"
                + "</div>"
                + "<p>Log in to your company dashboard to review this application.</p>"
        );
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendShortlistNotification(String toEmail, String candidateName,
                                           String jobTitle, String companyName) {
        String subject = "You've been shortlisted — " + jobTitle;
        String body = buildEmailHtml(
                "Congratulations!",
                "<p>Hi " + esc(candidateName) + ",</p>"
                + "<p>Great news! You have been <strong style='color:#3b82f6;'>shortlisted</strong> for "
                + "<strong>" + esc(jobTitle) + "</strong> at <strong>" + esc(companyName) + "</strong>.</p>"
                + "<p>You were selected as a top candidate based on your AI match score.</p>"
                + "<p>The company may reach out to you soon regarding next steps.</p>"
        );
        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!mailEnabled) {
            log.info("Email disabled. Would send to={}, subject={}", to, subject);
            return;
        }
        if (to == null || to.isBlank()) {
            log.warn("Cannot send email: recipient address is empty. subject={}", subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to={}: {}", to, e.getMessage());
        }
    }

    private String buildEmailHtml(String heading, String content) {
        return "<!DOCTYPE html>"
                + "<html><head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'>"
                + "<div style='max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);'>"
                + "<div style='background:#3b82f6;padding:24px 32px;'>"
                + "<h1 style='margin:0;color:#ffffff;font-size:20px;font-weight:600;'>" + heading + "</h1>"
                + "</div>"
                + "<div style='padding:32px;color:#1f2937;font-size:15px;line-height:1.6;'>"
                + content
                + "</div>"
                + "<div style='padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;'>"
                + "<p style='margin:0;color:#9ca3af;font-size:12px;'>JobPortal — AI-Powered Job Matching</p>"
                + "</div>"
                + "</div>"
                + "</body></html>";
    }

    private String formatStatus(String status) {
        if (status == null) return "Unknown";
        return switch (status) {
            case "PENDING" -> "Pending";
            case "REVIEWING" -> "Under Review";
            case "SHORTLISTED" -> "Shortlisted";
            case "INTERVIEW" -> "Interview";
            case "OFFERED" -> "Offered";
            case "REJECTED" -> "Rejected";
            case "HIRED" -> "Hired";
            case "WITHDRAWN" -> "Withdrawn";
            default -> status;
        };
    }

    private String esc(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
