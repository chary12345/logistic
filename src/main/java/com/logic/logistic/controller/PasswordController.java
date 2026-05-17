package com.logic.logistic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;
import com.logic.logistic.dto.PasswordChangeRequest;
import com.logic.logistic.service.UserService;

@RestController
@RequestMapping("/api")
public class PasswordController {

    @Autowired
    private UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        String status = userService.changeUserPassword(
                request.getUsername(),
                request.getCurrentPassword(),
                request.getNewPassword(),
                request.getGroup()
        );

        if ("SUCCESS".equals(status)) {
            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } else if ("USER_NOT_FOUND".equals(status)) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "User profile not found in system."));
        } else if ("INCORRECT_PASSWORD".equals(status)) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "The current password you entered is incorrect."));
        } else if ("SAME_AS_CURRENT".equals(status)) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "The new password cannot be the same as the current password."));
        } else {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Unable to update password. Critical system error."));
        }
    }
}
