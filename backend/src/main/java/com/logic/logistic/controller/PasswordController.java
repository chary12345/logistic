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
        boolean isChanged = userService.changeUserPassword(
                request.getUsername(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        if (isChanged) {
            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } else {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Failed to change password. Incorrect credentials."));
        }
    }
}
