package com.logic.logistic.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.LoginRequest;
import com.logic.logistic.service.LoginService;



@RestController
@RequestMapping("/api")
public class CompanyLoginController {


   
    @Autowired
	private LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    	Map<String, Object> map =null;
    	try {
 			map = loginService.userLogin(request);
 			System.out.println(map);
 			if (map.containsValue("SUCCESS")) {
 			
 				return ResponseEntity.ok(map);
 			}
 			else if (map.containsValue("FAILURE")) {
 				
 				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
 			}
 			else {
 				
 				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
 			}
    	}catch (Exception e) {
    		map.put("status", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}
      
      
    }
    
 

}
