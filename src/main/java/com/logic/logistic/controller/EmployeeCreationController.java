package com.logic.logistic.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import com.logic.logistic.dto.UserDto;
import com.logic.logistic.model.User;
import com.logic.logistic.service.EmployeecreationService;



@RestController
public class EmployeeCreationController {
	@Autowired
	private EmployeecreationService employeecreationService;
	
	@PostMapping("/addEmployee")
	public ResponseEntity<Map<String, String>> addNewEmployee(@RequestBody User employee) {
		Map<String, String> map = new HashMap<String, String>();
		try {

			String empResponse = employeecreationService.addNewEmployee(employee);
			if ("SUCCESS".equalsIgnoreCase(empResponse)) {
				map.put("message", empResponse);
				map.put("status", empResponse);
				return ResponseEntity.ok(map);
			} else if ("FAILURE".equalsIgnoreCase(empResponse)) {
				map.put("message", empResponse);
				map.put("status", empResponse);
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
			} else {
				map.put("status", empResponse);
				map.put("message", empResponse);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
			}

		} catch (Exception e) {
			map.put("status", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}

	}
	
	// API endpoint to validate username availability
    @PostMapping("/validate-username")
    public ResponseEntity<Map<String,String>> validateUsername(@RequestBody Map<String, String> request) {
		Map<String, String> map = new HashMap<String, String>();
		String username = request.get("username");
	    String companyCode = request.get("companyCode");
    	String existsByUserName = employeecreationService.existsByUserName(username, companyCode);
    	if ("SUCCESS".equalsIgnoreCase(existsByUserName)) {
			map.put("status", "");
			return ResponseEntity.ok(map);
		}
		else if ("FAILURE".equalsIgnoreCase(existsByUserName)) {
			map.put("status", "User Name already taken");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
		}
        return ResponseEntity.ok().body(map);
    }
    
  
    @GetMapping("/employeeList")
    public List<String> getEmployeesByCompanyAndBranch(@RequestParam String companyCode,
                                                       @RequestParam String branchCode) {
        return employeecreationService.getEmployeesByBranch(companyCode, branchCode);
    }

    @GetMapping("/employeesByCompany/{companyCode}")
    public ResponseEntity<Map<String, Object>> getEmployeesByCompany(@PathVariable String companyCode) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<UserDto> employees = employeecreationService.getEmployeesByCompany(companyCode);
            map.put("status", "SUCCESS");
            map.put("data", employees);
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            map.put("status", "FAILURE");
            map.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    @GetMapping("/employeesByBranch")
    public ResponseEntity<Map<String, Object>> getEmployeesByBranch(
            @RequestParam String companyCode,
            @RequestParam String branchCode) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<UserDto> employees = employeecreationService.getEmployeesByBranchFull(companyCode, branchCode);
            map.put("status", "SUCCESS");
            map.put("data", employees);
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            map.put("status", "FAILURE");
            map.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    @GetMapping("/getEmployeeDetails/{userId}")
    public ResponseEntity<UserDto> getEmployeeDetails(@PathVariable String userId) {
        UserDto employee = employeecreationService.getEmployeeByUserId(userId);
        if (employee != null) {
            return ResponseEntity.ok(employee);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/updateEmployee/{userId}")
    public ResponseEntity<Map<String, Object>> updateEmployee(@PathVariable String userId, @RequestBody User updatedEmployee) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDto saved = employeecreationService.updateEmployee(userId, updatedEmployee);
            response.put("status", "SUCCESS");
            response.put("data", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "FAILURE");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}
