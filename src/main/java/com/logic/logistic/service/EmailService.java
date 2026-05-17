package com.logic.logistic.service;

import jakarta.mail.internet.MimeMessage;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LogManager.getLogger();

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.company.name}")
    private String companyName;

    @Autowired
    private com.logic.logistic.repository.CompanyRegisterrepo companyRegisterrepo;

    @Autowired
    private com.logic.logistic.repository.BranchRepo branchRepo;

    // Password update email helper
    @Async
    public void sendPasswordChangeEmail(
            String toEmail,
            String fullName,
            String username,
            String oldPasswordPlain,
            String newPasswordPlain,
            String companyCode,
            String branchCode) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Email address is blank, skipping password change notification.");
            return;
        }

        try {
            // Fetch metadata for display
            String companyFullName = null;
            try {
                com.logic.logistic.dto.CompanyDto cd = companyRegisterrepo.getCompanyByID(companyCode);
                if (cd != null) companyFullName = cd.getCompanyFullName();
            } catch (Exception e) {
                logger.warn("Could not fetch company full name for email: {}", e.getMessage());
            }

            String branchName = null;
            if (branchCode != null && !branchCode.isBlank()) {
                try {
                    com.logic.logistic.dto.BranchDTO bd = branchRepo.getBranchBybranchCode(branchCode);
                    if (bd != null) branchName = bd.getBranchName();
                } catch (Exception e) {
                    logger.warn("Could not fetch branch name for email: {}", e.getMessage());
                }
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " — Security Alert: Password Has Been Updated");
            helper.setText(buildPasswordChangeEmailHtml(
                    fullName, username, oldPasswordPlain, newPasswordPlain,
                    companyCode, companyFullName != null ? companyFullName : companyName,
                    branchName != null ? branchName : "-", branchCode != null ? branchCode : "-"), true);

            mailSender.send(message);
            logger.info("Password change notification email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send password update email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ────────────────────────────────────────────────────────────────
    // EMPLOYEE WELCOME EMAIL
    // ────────────────────────────────────────────────────────────────
    @Async
    public void sendEmployeeWelcomeEmail(
            String toEmail,
            String ccEmail,
            String employeeFullName,
            String username,
            String plainPassword,
            String companyCode,
            String companyFullName,
            String branchCode,
            String branchName,
            String role,
            String phone) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Employee email is blank, skipping welcome email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            if (ccEmail != null && !ccEmail.isBlank() && !ccEmail.equalsIgnoreCase(toEmail)) {
                helper.setCc(ccEmail);
            }
            helper.setSubject("Welcome to " + companyName + " — Your Account Credentials");
            helper.setText(buildEmployeeEmailHtml(
                    employeeFullName, username, plainPassword,
                    companyCode, companyFullName != null ? companyFullName : companyName,
                    branchCode, branchName, role, phone), true);

            mailSender.send(message);
            logger.info("Employee welcome email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send employee welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendBranchWelcomeEmail(
            String toEmail,
            String branchCode,
            String branchName,
            String branchType,
            String companyCode,
            String country,
            String state,
            String city,
            String addressStreet,
            String postalCode,
            String phone,
            String phone2,
            String gstin,
            String contactPerson,
            String createdBy) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Branch email is blank, skipping welcome email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " — New Branch Setup Confirmation: " + branchName);
            helper.setText(buildBranchEmailHtml(
                    branchCode, branchName, branchType, companyCode,
                    country, state, city, addressStreet, postalCode,
                    phone, phone2, gstin, contactPerson, createdBy), true);

            mailSender.send(message);
            logger.info("Branch welcome email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send branch welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendBranchUpdateEmail(
            String toEmail,
            String branchCode,
            String branchName,
            String branchType,
            String companyCode,
            String country,
            String state,
            String city,
            String addressStreet,
            String postalCode,
            String phone,
            String phone2,
            String gstin,
            String contactPerson,
            boolean isActive,
            java.util.Map<String, String[]> changes) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Branch email is blank, skipping update email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " — " + (isActive ? "Branch Information Updated" : "Branch Deactivation Notice") + ": " + branchName);
            helper.setText(buildBranchUpdateEmailHtml(
                    branchCode, branchName, branchType, companyCode,
                    country, state, city, addressStreet, postalCode,
                    phone, phone2, gstin, contactPerson, isActive, changes), true);

            mailSender.send(message);
            logger.info("Branch update email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send branch update email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendBranchDeleteEmail(
            String toEmail,
            String branchCode,
            String branchName,
            String companyCode) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Branch email is blank, skipping deletion email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " — Branch Deactivation Notice: " + branchName);
            helper.setText(buildBranchDeleteEmailHtml(branchCode, branchName, companyCode), true);

            mailSender.send(message);
            logger.info("Branch deletion email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send branch deletion email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendEmployeeUpdateEmail(
            String toEmail,
            String employeeFullName,
            String username,
            String companyCode,
            String companyFullName,
            String branchCode,
            String branchName,
            String role,
            String phone,
            boolean isActive,
            java.util.Map<String, String[]> changes) {

        if (toEmail == null || toEmail.isBlank()) {
            logger.warn("Employee email is blank, skipping update email.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, companyName);
            helper.setTo(toEmail);
            helper.setSubject(companyName + " — " + (isActive ? "Employee Profile Updated" : "Employee Deactivation Notice") + ": " + employeeFullName);
            helper.setText(buildEmployeeUpdateEmailHtml(
                    employeeFullName, username,
                    companyCode, companyFullName != null ? companyFullName : companyName,
                    branchCode, branchName, role, phone, isActive, changes), true);

            mailSender.send(message);
            logger.info("Employee update email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send employee update email to {}: {}", toEmail, e.getMessage());
        }
    }

    // HTML template for password change email
    private String buildPasswordChangeEmailHtml(
            String name, String username, String oldPassword, String newPassword,
            String companyCode, String companyFullName,
            String branchName, String branchCode) {

        String today = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        
        // Modern Enterprise Theme: Deep Indigo/Violet gradients
        String gradient = "linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #8b5cf6 100%)";
        String accentColor = "#4338ca";
        String bannerBg = "#3730a3";

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Security Notification</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:36px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:%s;padding:36px 40px 30px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:1px;">%s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.85);margin-top:6px;letter-spacing:1.5px;text-transform:uppercase;">Enterprise Access Security</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:8px 16px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">🔐 SECURITY ALERT</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ACTION BANNER -->
                    <tr>
                      <td style="background:%s;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#ffffff;font-style:italic;">
                          ✦ &nbsp;Security Confirmation: Account password successfully updated.
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:40px 40px 32px 40px;">
                        <h2 style="margin:0 0 16px 0;font-size:20px;color:#1e1b4b;font-weight:700;">Password Has Been Changed</h2>
                        
                        <p style="margin:0 0 24px 0;font-size:14px;color:#4b5563;line-height:1.7;">
                          Hi <strong>%s</strong>,<br><br>
                          We are writing to notify you that your account password was recently updated on our secure servers. 
                          Below are the critical details regarding this change for your permanent reference.
                        </p>

                        <!-- LOG SUMMARY TABLE -->
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding: 16px; margin-bottom:28px;">
                           <table width="100%%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                              <tr>
                                <td width="120" style="color:#64748b; padding:6px 0; font-weight:500;">Occurrence Time</td>
                                <td style="color:#1e293b; padding:6px 0; font-weight:600;">%s</td>
                              </tr>
                              <tr>
                                <td style="color:#64748b; padding:6px 0; font-weight:500;">Status</td>
                                <td style="padding:6px 0;"><span style="background:#dcfce7; color:#166534; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:700;">COMPLETED</span></td>
                              </tr>
                           </table>
                        </div>

                        <!-- CREDENTIAL COMPARISON BOX -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d8b4fe;border-radius:12px;margin-bottom:28px;overflow:hidden;box-shadow: 0 2px 6px rgba(139,92,246,0.05);">
                          <tr>
                            <td style="background:#f5f3ff;padding:16px 20px;border-bottom:1px solid #ede9fe;">
                              <p style="margin:0;font-size:12px;font-weight:700;color:#5b21b6;letter-spacing:2px;text-transform:uppercase;">Credential Log Summary</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:16px 20px;">
                                <table width="100%%" cellpadding="8" cellspacing="0" style="font-size:13px;">
                                    <tr>
                                        <td width="120" style="color:#7c3aed; font-weight:600;">Previous Password:</td>
                                        <td style="font-family:monospace; background:#fdf2f8; color:#db2777; border-radius:6px; text-decoration: line-through; letter-spacing:1px;">%s</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#7c3aed; font-weight:600; padding-top:12px;">Current Password:</td>
                                        <td style="font-family:monospace; background:#ecfdf5; color:#059669; border-radius:6px; font-weight:700; padding-top:12px; letter-spacing:1px;">%s</td>
                                    </tr>
                                </table>
                            </td>
                          </tr>
                        </table>

                        <!-- ACCOUNT CONTEXT -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fcfcfc;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                          <tr>
                            <td style="padding:16px 20px 4px 20px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;">Context Information</p>
                              <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- SECURITY WARNING (VITAL) -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;margin-bottom:28px;">
                          <tr>
                            <td style="padding:16px 20px;">
                              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                                <strong>🛡 Security Notice:</strong> If this was you, no further action is necessary. 
                                <strong>However</strong>, if you did not initiate this password reset, someone else may be accessing your account. 
                                Please reset your password immediately and contact global security administration.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                          Regards,<br>
                          Security Engineering Team<br>
                          <a href="mailto:%s" style="color:%s;text-decoration:none;font-weight:500;">%s</a>
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#1e1b4b;padding:24px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#c7d2fe;">© %d %s.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#818cf8;">Confidential communication.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#818cf8;font-weight:600;letter-spacing:1px;">SECURED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                gradient,
                companyName,
                bannerBg,
                name,
                today,
                oldPassword,
                newPassword,
                buildRow(accentColor, "Authorized User", username)
                    + buildRow(accentColor, "Organization", companyFullName + " (" + companyCode + ")")
                    + buildRow(accentColor, "Location Profile", branchName + " (" + branchCode + ")"),
                fromEmail, accentColor, fromEmail,
                java.time.LocalDate.now().getYear(),
                companyName
        );
    }

    // ────────────────────────────────────────────────────────────────
    // HTML TEMPLATE — EMPLOYEE
    // ────────────────────────────────────────────────────────────────
    private String buildEmployeeEmailHtml(
            String name, String username, String password,
            String companyCode, String companyFullName,
            String branchCode, String branchName,
            String role, String phone) {

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to %s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1b5e20 0%%,#2e7d32 60%%,#43a047 100%%);padding:36px 40px 28px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">%s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Logistics Management System</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">EMPLOYEE ACCOUNT</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- WELCOME BANNER -->
                    <tr>
                      <td style="background:#2e7d32;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#e8f5e9;font-style:italic;">
                          ✦ &nbsp;Welcome aboard, <strong style="color:#ffffff;">%s</strong>! Your employee account has been successfully created.
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:36px 40px 28px 40px;">
                        <p style="margin:0 0 8px 0;font-size:14px;color:#546e7a;">Date of Account Creation</p>
                        <p style="margin:0 0 24px 0;font-size:14px;color:#263238;font-weight:600;">%s</p>

                        <p style="margin:0 0 20px 0;font-size:14px;color:#37474f;line-height:1.7;">
                          Dear <strong>%s</strong>,<br>
                          Your account has been set up on the <strong>%s</strong> platform. Please find your login credentials below.
                          You are advised to change your password immediately upon first login.
                        </p>

                        <!-- CREDENTIALS BOX -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f8e9;border:1px solid #a5d6a7;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#1b5e20;letter-spacing:2px;text-transform:uppercase;">Login Credentials</p>
                              <hr style="border:none;border-top:2px solid #a5d6a7;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- COMPANY INFO BOX -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#f57f17;letter-spacing:2px;text-transform:uppercase;">Company & Branch Details</p>
                              <hr style="border:none;border-top:2px solid #ffe082;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- SECURITY WARNING -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fce4ec;border-left:4px solid #e91e63;border-radius:6px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:14px 18px;">
                              <p style="margin:0;font-size:13px;color:#880e4f;line-height:1.6;">
                                <strong>⚠ Security Notice:</strong> This email contains sensitive credentials.
                                Please change your password after first login and do not share your credentials with anyone.
                                If you did not expect this email, contact your administrator immediately.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#78909c;line-height:1.6;">
                          For assistance, contact your branch administrator or reach us at
                          <a href="mailto:%s" style="color:#2e7d32;text-decoration:none;">%s</a>.
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#eceff1;padding:20px 40px;border-top:1px solid #e0e0e0;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#90a4ae;">© %d %s. All rights reserved.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#b0bec5;">This is an automated email. Please do not reply directly to this message.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#b0bec5;font-weight:600;">POWERED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                companyName,                                              // title
                companyName,                                              // header company name
                name,                                                     // welcome banner name
                today,                                                    // account creation date
                name,                                                     // Dear name
                companyName,                                              // platform name
                buildRow("#1b5e20", "Username", username)
                    + buildRow("#1b5e20", "Password", password)
                    + buildRow("#1b5e20", "Role", role)
                    + (phone != null && !phone.isBlank() ? buildRow("#1b5e20", "Phone", phone) : ""),
                buildRow("#f57f17", "Company", companyFullName)
                    + buildRow("#f57f17", "Company Code", companyCode)
                    + buildRow("#f57f17", "Branch", branchName != null ? branchName : "-")
                    + buildRow("#f57f17", "Branch Code", branchCode != null ? branchCode : "-"),
                fromEmail, fromEmail,                                    // support email x2
                LocalDate.now().getYear(),                               // year
                companyName                                              // footer company
        );
    }

    // ────────────────────────────────────────────────────────────────
    // HTML TEMPLATE — BRANCH
    // ────────────────────────────────────────────────────────────────
    private String buildBranchEmailHtml(
            String branchCode, String branchName, String branchType,
            String companyCode, String country, String state, String city,
            String addressStreet, String postalCode,
            String phone, String phone2, String gstin,
            String contactPerson, String createdBy) {

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Branch Setup — %s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1b5e20 0%%,#2e7d32 60%%,#43a047 100%%);padding:36px 40px 28px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">%s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Logistics Management System</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">NEW BRANCH SETUP</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- STATUS BANNER -->
                    <tr>
                      <td style="background:#2e7d32;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#e8f5e9;font-style:italic;">
                          ✦ &nbsp;Branch <strong style="color:#ffffff;">%s</strong> has been successfully created and activated.
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:36px 40px 28px 40px;">
                        <p style="margin:0 0 24px 0;font-size:14px;color:#37474f;line-height:1.7;">
                          This is an official confirmation that the branch listed below has been registered
                          under <strong>%s</strong> on <strong>%s</strong> by <strong>%s</strong>.
                          The branch is now active and operational in the system.
                        </p>

                        <!-- BRANCH IDENTITY -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f8e9;border:1px solid #a5d6a7;border-radius:10px;margin-bottom:20px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#1b5e20;letter-spacing:2px;text-transform:uppercase;">Branch Identity</p>
                              <hr style="border:none;border-top:2px solid #a5d6a7;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- LOCATION DETAILS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#e8f5e9;border:1px solid #81c784;border-radius:10px;margin-bottom:20px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#2e7d32;letter-spacing:2px;text-transform:uppercase;">Location Details</p>
                              <hr style="border:none;border-top:2px solid #81c784;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- CONTACT & OPERATIONS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#f57f17;letter-spacing:2px;text-transform:uppercase;">Contact & Operations</p>
                              <hr style="border:none;border-top:2px solid #ffe082;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#78909c;line-height:1.6;">
                          For any queries regarding this branch setup, please contact the system administrator at
                          <a href="mailto:%s" style="color:#2e7d32;text-decoration:none;">%s</a>.
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#eceff1;padding:20px 40px;border-top:1px solid #e0e0e0;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#90a4ae;">© %d %s. All rights reserved.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#b0bec5;">This is an automated email. Please do not reply directly to this message.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#b0bec5;font-weight:600;">POWERED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                companyName,             // html title
                companyName,             // header name
                branchName,              // status banner
                companyName,             // confirmation text company
                today,                   // confirmation date
                (createdBy != null && !createdBy.isBlank() ? createdBy : "System Administrator"),
                // Branch Identity rows
                buildRow("#1b5e20", "Company Code", companyCode)
                    + buildRow("#1b5e20", "Branch Code", branchCode)
                    + buildRow("#1b5e20", "Branch Name", branchName)
                    + buildRow("#1b5e20", "Branch Type", branchType != null ? branchType : "-"),
                // Location rows
                buildRow("#2e7d32", "Country", country != null && !country.isBlank() ? (country.substring(0, 1).toUpperCase() + country.substring(1)) : "-")
                    + buildRow("#2e7d32", "State", state != null && !state.isBlank() ? state : "-")
                    + buildRow("#2e7d32", "City", city != null && !city.isBlank() ? city : "-")
                    + buildRow("#2e7d32", "Street Address", addressStreet != null && !addressStreet.isBlank() ? addressStreet : "-")
                    + buildRow("#2e7d32", "Postal Code", postalCode != null && !postalCode.isBlank() ? postalCode : "-"),
                // Contact rows
                buildRow("#f57f17", "Contact Person", contactPerson != null && !contactPerson.isBlank() ? contactPerson : "-")
                    + buildRow("#f57f17", "Primary Phone", phone != null && !phone.isBlank() ? phone : "-")
                    + buildRow("#f57f17", "Alternate Phone", phone2 != null && !phone2.isBlank() ? phone2 : "-")
                    + buildRow("#f57f17", "GSTIN", gstin != null && !gstin.isBlank() ? gstin : "-"),
                fromEmail, fromEmail,
                LocalDate.now().getYear(),
                companyName
        );
    }

    private String buildBranchUpdateEmailHtml(
            String branchCode, String branchName, String branchType,
            String companyCode, String country, String state, String city,
            String addressStreet, String postalCode,
            String phone, String phone2, String gstin,
            String contactPerson, boolean isActive,
            java.util.Map<String, String[]> changes) {

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        // 🎨 Dynamic Styling variables based on status
        String gradient = isActive ? "linear-gradient(135deg,#1a237e 0%,#3f51b5 60%,#7986cb 100%)" : "linear-gradient(135deg,#b71c1c 0%,#d32f2f 60%,#ef5350 100%)";
        String bannerBg = isActive ? "#303f9f" : "#c62828";
        String bannerIcon = isActive ? "✦" : "⚠";
        String badgeText = isActive ? "BRANCH DETAILS UPDATED" : "BRANCH DEACTIVATED";
        String bannerStatusText = isActive ? "information has been successfully updated." : "has been successfully DEACTIVATED.";
        String bodyHeadingText = isActive ? "modified and updated" : "<span style='color:#d32f2f;font-weight:bold;'>DEACTIVATED</span> (made inactive)";
        String accentColor = isActive ? "#1a237e" : "#c62828";
        String lightAccent = isActive ? "#3f51b5" : "#d32f2f";
        String statusColorBox = isActive ? "#e8f5e9" : "#ffebee";
        String statusTextColor = isActive ? "#2e7d32" : "#c62828";
        String statusTextLabel = isActive ? "Active" : "De-Activated";

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Branch Notification — %1$s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:%2$s;padding:36px 40px 28px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">%1$s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Logistics Management System</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">%3$s</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- STATUS BANNER -->
                    <tr>
                      <td style="background:%4$s;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#ffffff;font-style:italic;font-weight:500;">
                          %5$s &nbsp;Branch <strong style="color:#ffffff;">%6$s</strong> %7$s
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:36px 40px 28px 40px;">
                        <p style="margin:0 0 24px 0;font-size:14px;color:#37474f;line-height:1.7;">
                          This is an official notification that the profile details for branch <strong>%6$s</strong>
                          have been %8$s under <strong>%1$s</strong> on <strong>%9$s</strong>.
                        </p>

                        <!-- LIVE STATUS PILL -->
                        <div style="margin-bottom:24px;">
                            <span style="font-size:12px;color:#546e7a;font-weight:600;margin-right:8px;">CURRENT STATUS:</span>
                            <span style="background-color:%10$s;color:%11$s;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;display:inline-block;">%12$s</span>
                        </div>

                        %21$s

                        <!-- BRANCH IDENTITY -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border:1px solid #e0e0e0;border-radius:10px;margin-bottom:20px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:%13$s;letter-spacing:2px;text-transform:uppercase;">Branch Identity</p>
                              <hr style="border:none;border-top:2px solid #d1d1d1;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %14$s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- LOCATION DETAILS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:%15$s;letter-spacing:2px;text-transform:uppercase;">Location Details</p>
                              <hr style="border:none;border-top:2px solid #cbd5e1;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %16$s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- CONTACT & OPERATIONS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#f57f17;letter-spacing:2px;text-transform:uppercase;">Contact & Operations</p>
                              <hr style="border:none;border-top:2px solid #ffe082;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %17$s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- CONFIG CHANGE WARNING -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid %13$s;border-radius:6px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:14px 18px;">
                              <p style="margin:0;font-size:13px;color:#37474f;line-height:1.6;">
                                <strong>ℹ Administrative Notice:</strong>
                                %18$s
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#78909c;line-height:1.6;">
                          For any queries, please contact the support team at
                          <a href="mailto:%19$s" style="color:%15$s;text-decoration:none;font-weight:600;">%19$s</a>.
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#eceff1;padding:20px 40px;border-top:1px solid #e0e0e0;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#90a4ae;">© %20$d %1$s. All rights reserved.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#b0bec5;">This is an automated email. Please do not reply directly to this message.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#b0bec5;font-weight:600;">POWERED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                companyName,             // 1
                gradient,                // 2
                badgeText,               // 3
                bannerBg,                // 4
                bannerIcon,              // 5
                branchName,              // 6
                bannerStatusText,        // 7
                bodyHeadingText,         // 8
                today,                   // 9
                statusColorBox,          // 10
                statusTextColor,         // 11
                statusTextLabel,         // 12
                accentColor,             // 13
                // Branch Identity rows (14)
                buildRow(accentColor, "Branch Status", "<strong style='color:" + statusTextColor + "'>" + statusTextLabel.toUpperCase() + "</strong>")
                    + buildRow(accentColor, "Company Code", companyCode)
                    + buildRow(accentColor, "Branch Code", branchCode)
                    + buildRow(accentColor, "Branch Name", branchName)
                    + buildRow(accentColor, "Branch Type", branchType != null ? branchType : "-"),
                lightAccent,             // 15
                // Location rows (16)
                buildRow(lightAccent, "Country", country != null && !country.isBlank() ? (country.substring(0, 1).toUpperCase() + country.substring(1)) : "-")
                    + buildRow(lightAccent, "State", state != null && !state.isBlank() ? state : "-")
                    + buildRow(lightAccent, "City", city != null && !city.isBlank() ? city : "-")
                    + buildRow(lightAccent, "Street Address", addressStreet != null && !addressStreet.isBlank() ? addressStreet : "-")
                    + buildRow(lightAccent, "Postal Code", postalCode != null && !postalCode.isBlank() ? postalCode : "-"),
                // Contact rows (17)
                buildRow("#f57f17", "Contact Person", contactPerson != null && !contactPerson.isBlank() ? contactPerson : "-")
                    + buildRow("#f57f17", "Primary Phone", phone != null && !phone.isBlank() ? phone : "-")
                    + buildRow("#f57f17", "Alternate Phone", phone2 != null && !phone2.isBlank() ? phone2 : "-")
                    + buildRow("#f57f17", "GSTIN", gstin != null && !gstin.isBlank() ? gstin : "-"),
                (isActive 
                    ? "This email confirms a successful branch modification. If you did not initiate this, please notify the administrator."
                    : "This branch has been flagged as INACTIVE. Direct operations against this location are temporarily suspended."), // 18
                fromEmail,               // 19
                LocalDate.now().getYear(), // 20
                buildDiffSectionHtml(changes) // 21
        );
    }

    private String buildBranchDeleteEmailHtml(
            String branchCode, String branchName, String companyCode) {

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Branch Deactivated — %s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#b71c1c 0%%,#d32f2f 60%%,#e53935 100%%);padding:36px 40px 28px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">%s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Logistics Management System</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">BRANCH REMOVED</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- STATUS BANNER -->
                    <tr>
                      <td style="background:#c62828;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#ffebee;font-style:italic;">
                          ⚠ &nbsp;Branch <strong style="color:#ffffff;">%s</strong> has been successfully deactivated and removed.
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:36px 40px 28px 40px;">
                        <p style="margin:0 0 24px 0;font-size:14px;color:#37474f;line-height:1.7;">
                          This is an official deactivation notice confirming that the branch <strong>%s</strong>
                          has been deleted and removed from active operations under <strong>%s</strong> on <strong>%s</strong>.
                        </p>

                        <!-- BRANCH DELETION DETAILS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e0e0e0;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#c62828;letter-spacing:2px;text-transform:uppercase;">Removal Summary</p>
                              <hr style="border:none;border-top:2px solid #e0e0e0;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- CRITICAL SECURITY WARNING / ADVISORY -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#ffebee;border-left:4px solid #ef5350;border-radius:6px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:14px 18px;">
                              <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#b71c1c;">⚠ Important Operational Advisory:</p>
                              <p style="margin:0;font-size:13px;color:#c62828;line-height:1.6;">
                                • Users assigned exclusively to this branch can no longer perform active transactions.<br>
                                • Booking, Loading, and Dispatch reports will continue to archive historical data for audit trail compliance.<br>
                                • Active system roles or routes assigned to this branch should be reassigned by the Super Admin.
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#78909c;line-height:1.6;">
                          If this deletion was performed in error or requires urgent administrative rollback, please contact emergency support at
                          <a href="mailto:%s" style="color:#d32f2f;text-decoration:none;">%s</a> immediately.
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#eceff1;padding:20px 40px;border-top:1px solid #e0e0e0;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#90a4ae;">© %d %s. All rights reserved.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#b0bec5;">This is an automated email. Please do not reply directly to this message.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#b0bec5;font-weight:600;">POWERED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                companyName,             // html title
                companyName,             // header name
                branchName,              // status banner
                branchName,              // body branch name
                companyName,             // confirmation text company
                today,                   // confirmation date
                // Branch Identity rows
                buildRow("#c62828", "Company Code", companyCode)
                    + buildRow("#c62828", "Branch Code", branchCode)
                    + buildRow("#c62828", "Branch Name", branchName)
                    + buildRow("#c62828", "Deactivation Date", today),
                fromEmail, fromEmail,
                LocalDate.now().getYear(),
                companyName
        );
    }

    private String buildEmployeeUpdateEmailHtml(
            String name, String username,
            String companyCode, String companyFullName,
            String branchCode, String branchName,
            String role, String phone, boolean isActive,
            java.util.Map<String, String[]> changes) {

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        String gradient = isActive ? "linear-gradient(135deg,#1a237e 0%,#3f51b5 60%,#7986cb 100%)" : "linear-gradient(135deg,#b71c1c 0%,#d32f2f 60%,#ef5350 100%)";
        String bannerBg = isActive ? "#303f9f" : "#c62828";
        String bannerIcon = isActive ? "✦" : "⚠";
        String badgeText = isActive ? "PROFILE UPDATED" : "ACCOUNT DEACTIVATED";
        String bannerStatusText = isActive ? "profile information has been successfully updated." : "account has been successfully DEACTIVATED.";
        String bodyHeadingText = isActive ? "modified and updated" : "<span style='color:#d32f2f;font-weight:bold;'>DEACTIVATED</span> (made inactive)";
        String accentColor = isActive ? "#1a237e" : "#c62828";
        String statusColorBox = isActive ? "#e8f5e9" : "#ffebee";
        String statusTextColor = isActive ? "#2e7d32" : "#c62828";
        String statusTextLabel = isActive ? "Active" : "Inactive";

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Account Notification — %1$s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:%2$s;padding:36px 40px 28px 40px;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">%1$s</div>
                              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Logistics Management System</div>
                            </td>
                            <td align="right">
                              <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;display:inline-block;">
                                <span style="font-size:11px;color:#ffffff;font-weight:600;letter-spacing:1px;">%3$s</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- STATUS BANNER -->
                    <tr>
                      <td style="background:%4$s;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#ffffff;font-style:italic;">
                          %5$s &nbsp;The employee <strong style="color:#ffffff;">%6$s</strong> %7$s
                        </p>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="padding:36px 40px 28px 40px;">
                        <p style="margin:0 0 24px 0;font-size:14px;color:#37474f;line-height:1.7;">
                          This is an official notification that the employee profile for <strong>%6$s</strong>
                          has been %8$s under <strong>%1$s</strong> on <strong>%9$s</strong>.
                        </p>

                        <!-- LIVE STATUS PILL -->
                        <div style="margin-bottom:24px;">
                            <span style="font-size:12px;color:#546e7a;font-weight:600;margin-right:8px;">ACCOUNT STATUS:</span>
                            <span style="background-color:%10$s;color:%11$s;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;display:inline-block;">%12$s</span>
                        </div>

                        %19$s

                        <!-- ACCOUNT IDENTITY -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border:1px solid #e0e0e0;border-radius:10px;margin-bottom:20px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:%13$s;letter-spacing:2px;text-transform:uppercase;">Account Profile</p>
                              <hr style="border:none;border-top:2px solid #d1d1d1;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %14$s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- COMPANY DETAILS -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#f57f17;letter-spacing:2px;text-transform:uppercase;">Company Mapping</p>
                              <hr style="border:none;border-top:2px solid #ffe082;margin:10px 0 16px 0;">
                            </td>
                          </tr>
                          %15$s
                          <tr><td style="height:12px;"></td></tr>
                        </table>

                        <!-- CONFIG CHANGE WARNING -->
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid %13$s;border-radius:6px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:14px 18px;">
                              <p style="margin:0;font-size:13px;color:#37474f;line-height:1.6;">
                                <strong>ℹ Administrative Notice:</strong>
                                %16$s
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#78909c;line-height:1.6;">
                          For any queries, please contact the support team at
                          <a href="mailto:%17$s" style="color:%13$s;text-decoration:none;font-weight:600;">%17$s</a>.
                        </p>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#eceff1;padding:20px 40px;border-top:1px solid #e0e0e0;">
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:12px;color:#90a4ae;">© %18$d %1$s. All rights reserved.</p>
                              <p style="margin:4px 0 0 0;font-size:11px;color:#b0bec5;">This is an automated email. Please do not reply directly to this message.</p>
                            </td>
                            <td align="right">
                              <p style="margin:0;font-size:11px;color:#b0bec5;font-weight:600;">POWERED BY 1UNIQ</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                companyName,                // 1
                gradient,                   // 2
                badgeText,                  // 3
                bannerBg,                   // 4
                bannerIcon,                 // 5
                name,                       // 6
                bannerStatusText,           // 7
                bodyHeadingText,            // 8
                today,                      // 9
                statusColorBox,             // 10
                statusTextColor,            // 11
                statusTextLabel,            // 12
                accentColor,                // 13
                // Account profile rows (14)
                buildRow(accentColor, "Username", username)
                    + buildRow(accentColor, "Role", role)
                    + buildRow(accentColor, "Phone", phone != null ? phone : "-"),
                // Company Mapping (15)
                buildRow("#f57f17", "Company", companyFullName)
                    + buildRow("#f57f17", "Company Code", companyCode)
                    + buildRow("#f57f17", "Branch Name", branchName != null ? branchName : "-")
                    + buildRow("#f57f17", "Branch Code", branchCode != null ? branchCode : "-"),
                (isActive 
                    ? "This email confirms a successful modification to your user account. If you did not initiate this, please contact the administrator."
                    : "This account has been flagged as INACTIVE. Your ability to login and access system services is temporarily suspended."), // 16
                fromEmail,                  // 17
                LocalDate.now().getYear(),   // 18
                buildDiffSectionHtml(changes) // 19
        );
    }

    // Helper for building modification diff table
    private String buildDiffSectionHtml(java.util.Map<String, String[]> changes) {
        if (changes == null || changes.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <!-- MODIFICATION SUMMARY -->
            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fdf8f3;border:1px solid #f57c00;border-radius:10px;margin-bottom:24px;overflow:hidden;">
              <tr>
                <td style="background:#f57c00;padding:12px 20px;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">📝 Summary of Modifications</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px;">
                  <table width="100%%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
                    <tr style="background:rgba(245, 124, 0, 0.08);">
                      <th align="left" style="border-bottom:2px solid #f57c00;color:#e65100;font-weight:700;">Attribute</th>
                      <th align="left" style="border-bottom:2px solid #f57c00;color:#e65100;font-weight:700;">Previous Value</th>
                      <th align="left" style="border-bottom:2px solid #f57c00;color:#e65100;font-weight:700;">Updated Value</th>
                    </tr>
            """);

        for (java.util.Map.Entry<String, String[]> entry : changes.entrySet()) {
            String label = entry.getKey();
            String oldVal = entry.getValue()[0] != null && !entry.getValue()[0].isBlank() ? entry.getValue()[0] : "<em>(Not Set)</em>";
            String newVal = entry.getValue()[1] != null && !entry.getValue()[1].isBlank() ? entry.getValue()[1] : "<em>(Cleared)</em>";
            sb.append(String.format("""
                    <tr>
                      <td style="border-bottom:1px solid #ffe0b2;font-weight:600;color:#4e342e;padding-top:12px;padding-bottom:12px;">%s</td>
                      <td style="border-bottom:1px solid #ffe0b2;color:#757575;text-decoration:line-through;font-style:italic;">%s</td>
                      <td style="border-bottom:1px solid #ffe0b2;color:#2e7d32;font-weight:600;background-color:#f1f8e9;">%s</td>
                    </tr>
            """, label, oldVal, newVal));
        }

        sb.append("""
                  </table>
                </td>
              </tr>
            </table>
            """);
        return sb.toString();
    }

    // ────────────────────────────────────────────────────────────────
    // SHARED HELPER — Table Row
    // ────────────────────────────────────────────────────────────────
    private String buildRow(String accentColor, String label, String value) {
        return """
            <tr>
              <td style="padding:4px 24px 10px 24px;">
                <table width="100%%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="150" style="font-size:12px;color:#78909c;font-weight:600;vertical-align:top;padding-top:2px;">%s</td>
                    <td style="font-size:14px;color:#263238;font-weight:500;border-left:3px solid %s;padding-left:12px;">%s</td>
                  </tr>
                </table>
              </td>
            </tr>
            """.formatted(label, accentColor, value != null ? value : "-");
    }
}
