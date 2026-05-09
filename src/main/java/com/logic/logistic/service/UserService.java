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

    public boolean changeUserPassword(String username, String currentPassword, String newPassword, String group) {
        String fullUsername = username + group;
        UserDto user = userRepository.findByUsername(fullUsername);

        if (user == null) {
            logger.info("User not found for username: " + fullUsername);
            return false;
        }

        // Validate current password
        if (!user.getPassword().equalsIgnoreCase(currentPassword)) {
            logger.info("Current password is incorrect for user: " + fullUsername);
            return false;
        }

        int rowsUpdated = userRepository.updatePassword(fullUsername, newPassword);

        if (rowsUpdated > 0) {
            logger.info("Password updated successfully!");
            return true;
        } else {
            logger.info("Failed to update password!");
            return false;
        }
    }
}
