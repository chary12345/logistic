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

    // ────────────────────────────────────────────────────────────────
    // BRANCH WELCOME EMAIL
    // ────────────────────────────────────────────────────────────────
    @Async
    public void sendBranchWelcomeEmail(
            String toEmail,
            String branchCode,
            String branchName,
            String branchType,
            String companyCode,
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
                    state, city, addressStreet, postalCode,
                    phone, phone2, gstin, contactPerson, createdBy), true);

            mailSender.send(message);
            logger.info("Branch welcome email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send branch welcome email to {}: {}", toEmail, e.getMessage());
        }
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
                      <td style="background:linear-gradient(135deg,#0d47a1 0%%,#1976d2 60%%,#42a5f5 100%%);padding:36px 40px 28px 40px;">
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
                      <td style="background:#1565c0;padding:18px 40px;">
                        <p style="margin:0;font-size:15px;color:#e3f2fd;font-style:italic;">
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
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fbff;border:1px solid #bbdefb;border-radius:10px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px 4px 24px;">
                              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#1565c0;letter-spacing:2px;text-transform:uppercase;">Login Credentials</p>
                              <hr style="border:none;border-top:2px solid #bbdefb;margin:10px 0 16px 0;">
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
                          <a href="mailto:%s" style="color:#1976d2;text-decoration:none;">%s</a>.
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
                buildRow("#1565c0", "Username", username)
                    + buildRow("#1565c0", "Password", password)
                    + buildRow("#1565c0", "Role", role)
                    + (phone != null && !phone.isBlank() ? buildRow("#1565c0", "Phone", phone) : ""),
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
            String companyCode, String state, String city,
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
                buildRow("#1b5e20", "Branch Code", branchCode)
                    + buildRow("#1b5e20", "Branch Name", branchName)
                    + buildRow("#1b5e20", "Branch Type", branchType != null ? branchType : "-")
                    + buildRow("#1b5e20", "Company Code", companyCode),
                // Location rows
                buildRow("#2e7d32", "State", state != null ? state : "-")
                    + buildRow("#2e7d32", "City", city != null ? city : "-")
                    + buildRow("#2e7d32", "Street Address", addressStreet != null && !addressStreet.isBlank() ? addressStreet : "-")
                    + buildRow("#2e7d32", "Postal Code", postalCode != null && !postalCode.isBlank() ? postalCode : "-"),
                // Contact rows
                buildRow("#f57f17", "Primary Phone", phone != null && !phone.isBlank() ? phone : "-")
                    + (phone2 != null && !phone2.isBlank() ? buildRow("#f57f17", "Alternate Phone", phone2) : "")
                    + (gstin != null && !gstin.isBlank() ? buildRow("#f57f17", "GSTIN", gstin) : "")
                    + (contactPerson != null && !contactPerson.isBlank() ? buildRow("#f57f17", "Contact Person", contactPerson) : ""),
                fromEmail, fromEmail,
                LocalDate.now().getYear(),
                companyName
        );
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
