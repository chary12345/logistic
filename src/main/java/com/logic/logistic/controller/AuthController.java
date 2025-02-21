package com.logic.logistic.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.services.TwilioService;

import ch.qos.logback.core.model.Model;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private TwilioService twilioService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String sendOtp = twilioService.sendOtp(request.get("phoneNumber"));
        return ResponseEntity.ok("OTP sent successfully:"+sendOtp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        boolean isValid = twilioService.verifyOtp(request.get("phoneNumber"), request.get("otp"));
        return isValid ? ResponseEntity.ok("Login successful") : ResponseEntity.status(401).body("Invalid OTP");
    }


}
