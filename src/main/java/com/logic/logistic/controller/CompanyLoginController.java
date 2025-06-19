package com.logic.logistic.controller;

import java.util.Collections;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
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

	private static final long serialVersionUID=1L;

	private static Logger logger = LogManager.getLogger();
   
    @Autowired
	private LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    	Map<String, Object> map =null;
    	try {
 			map = loginService.userLogin(request);
 			System.out.println(map);
 			logger.info("user login request"+ map);
 			if (map.containsValue("SUCCESS")) {
 			
 				logger.info("SUCCESS : "+map);
 				return ResponseEntity.ok(map);
 			}
 			else if (map.containsValue("FAILURE")) {
 				
 				logger.info("FAILURE : "+map);
 				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
 			}
 			else {
 				
 				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
 			}
    	}catch (Exception e) {
    		map.put("status", e.getMessage());
    		logger.error("Exception in login : "+e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}
      
      
    }
    
 

}
