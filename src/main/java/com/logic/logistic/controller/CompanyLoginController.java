package com.logic.logistic.controller;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.LoginRequest;
import com.logic.logistic.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class CompanyLoginController {


    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    	UserDto user = userRepository.findByUsername(request.getUsername(),request.getPassword());
        if (user != null && user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Login Successful"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("message", "Invalid Credentials"));
    }

}
