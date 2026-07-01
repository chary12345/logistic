package com.logic.logistic.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.logic.logistic.dto.UserDto;
import com.logic.logistic.repository.UserRepository;

@Service
public class UserService {

	private static final long serialVersionUID=1L;

	private static Logger logger = LogManager.getLogger();
	
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Change user password and return status
    public String changeUserPassword(String username, String currentPasswordEnc, String newPasswordEnc, String group) {
        String fullUsername = username + group;
        UserDto user = userRepository.findByUserNameAndCompanyCode(username, group);

        if (user == null) {
            logger.info("User not found for username: " + fullUsername);
            return "USER_NOT_FOUND";
        }

        // Validate current password
        if (!user.getPassword().equalsIgnoreCase(currentPasswordEnc)) {
            logger.info("Current password validation failed for user: " + fullUsername);
            return "INCORRECT_PASSWORD";
        }

        // Prevent setting new password same as current
        if (currentPasswordEnc.equalsIgnoreCase(newPasswordEnc)) {
            logger.info("User attempted to set new password identical to current password for user: " + fullUsername);
            return "SAME_AS_CURRENT";
        }

        int rowsUpdated = userRepository.updatePassword(fullUsername, newPasswordEnc);

        if (rowsUpdated > 0) {
            logger.info("Password updated successfully for user: {}", fullUsername);

            // Send security email async
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                String oldPlain = "**********";
                String newPlain = "**********";
                
                try {
                    // Decrypt password for email body
                    oldPlain = EncryptionUtil.Decrypt(currentPasswordEnc);
                    newPlain = EncryptionUtil.Decrypt(newPasswordEnc);
                } catch (Exception e) {
                    logger.error("Error decrypting passwords for notification email: {}", e.getMessage());
                }

                emailService.sendPasswordChangeEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    user.getUserName(),
                    oldPlain,
                    newPlain,
                    user.getCompanyCode(),
                    user.getBranchCode()
                );
            }


            return "SUCCESS";
        } else {
            logger.info("Database update failed for user: {}", fullUsername);
            return "UPDATE_FAILED";
        }
    }
}
