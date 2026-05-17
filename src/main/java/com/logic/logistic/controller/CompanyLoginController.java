package com.logic.logistic.controller;

import java.util.HashMap;
import java.util.Map;

import com.logic.logistic.dto.UserDto;
import com.logic.logistic.dto.UserPermissionDTO;
import com.logic.logistic.service.PermissionService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logic.logistic.model.LoginRequest;
import com.logic.logistic.service.LoginService;


@RestController
@RequestMapping("/api")
public class CompanyLoginController {

	private static final long serialVersionUID=1L;

	private static Logger logger = LogManager.getLogger();
   
    @Autowired
	private LoginService loginService;


	@Autowired
	private PermissionService permissionService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    	Map<String, Object> map =null;
    	try {
 			map = loginService.userLogin(request);
 			System.out.println(map);
 			logger.info("user login request"+ map);
 			if (map.containsValue("SUCCESS")) {
 				

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

	@GetMapping("/getPermissions")
	public ResponseEntity<?> getPermissions(
			@RequestParam String userName,
			@RequestParam String companyCode,
			@RequestParam String role) {

		Map<String, Object> response =
				new HashMap<>();

		try {

			UserPermissionDTO permission =
					permissionService.getPermissions(
							userName,
							companyCode,
							role
					);

			response.put("status", "SUCCESS");
			response.put("message",
					"Permissions fetched successfully");

			response.put("data", permission);

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			response.put("status", "FAILURE");
			response.put("message", e.getMessage());

			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(response);
		}
	}

	@PostMapping("/saveOrUpdatePermissions")
	public ResponseEntity<?> savePermissions(
			@RequestBody UserPermissionDTO dto) {

		Map<String, Object> response = new HashMap<>();

		try {

			UserPermissionDTO saved =
					loginService.saveOrUpdatePermissions(dto);

			response.put("status", "SUCCESS");

			response.put("message",
					"Permissions saved successfully");

			response.put("data", saved);

			return ResponseEntity.ok(response);

		} catch (Exception e) {

			response.put("status", "FAILURE");

			response.put("message", e.getMessage());

			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(response);
		}
	}

}
