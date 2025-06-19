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

    public boolean changeUserPassword(String username, String currentPassword, String newPassword) {
        UserDto user = userRepository.findByUsername(username);

        if (user == null) {
            System.out.println("User not found or incorrect password!");
            logger.info("User not found or incorrect password!");
            return false;
        }

        int rowsUpdated = userRepository.updatePassword(username, newPassword);

        if (rowsUpdated > 0) {
            System.out.println("Password updated successfully!");
            logger.info("Password updated successfully!");
            return true;
        } else {
            System.out.println("Failed to update password!");
            logger.info("Failed to update password!");
            return false;
        }
    }
}
