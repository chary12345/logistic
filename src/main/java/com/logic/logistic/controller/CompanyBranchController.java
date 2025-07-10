package com.logic.logistic.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.LogisticApplication;
import com.logic.logistic.model.Branch;
import com.logic.logistic.model.BranchMap;
import com.logic.logistic.service.CompanyRegisterService;




@RestController
public class CompanyBranchController {
	
	private static final long serialVersionUID=1L;
	
	private static Logger logger = LogManager.getLogger();
	
	@Autowired
	private CompanyRegisterService companyRegisterService;

	@GetMapping("/validate-company-code")
	public ResponseEntity<Map<String, String>> validateCompanyCode(@RequestParam String companyCode) {
		Map<String, String> map = new HashMap<String, String>();
		try {
			String isCompanyCodeExists = companyRegisterService.isCompanyCodeExists(companyCode);
			if ("SUCCESS".equalsIgnoreCase(isCompanyCodeExists)) {

				logger.info("success");
				map.put("status", "");
				return ResponseEntity.ok(map);
			} else {
				map.put("status", "COMPANYCODE already taken");
				logger.info("COMPANYCODE already taken");

				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
			}
		} catch (Exception e) {
			map.put("status", e.getMessage());
			logger.error("Exception in validateCompanyCode"+e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}
	}

	@GetMapping("/validate-branch-code")
	public ResponseEntity<Map<String, String>> validateBrancCode(@RequestParam String branchCode) {
		Map<String, String> map = new HashMap<String, String>();
		try {
			String isBranchCodeExists = companyRegisterService.isBranchCodeExist(branchCode);
			if ("SUCCESS".equalsIgnoreCase(isBranchCodeExists)) {

				map.put("status", "");
				return ResponseEntity.ok(map);
			} else {
				map.put("status", "BranchCode already taken");

				logger.info("BranchCode already taken");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
			}
		} catch (Exception e) {
			logger.error("Exception in validateBrancCode"+e);
			map.put("status", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}
	}

	@PostMapping("/createBranch")
	public ResponseEntity<Map<String, String>> createBranch(@RequestBody Branch branchData) {
		Map<String, String> map = new HashMap<String, String>();
		try {

			String branchCreationResponse = companyRegisterService.craeteBranch(branchData);
			if ("SUCCESS".equalsIgnoreCase(branchCreationResponse)) {
				map.put("message", branchCreationResponse);
				logger.info("SUCCESS"+branchCreationResponse);
				map.put("status", branchCreationResponse);
				return ResponseEntity.ok(map);
			} else if ("FAILURE".equalsIgnoreCase(branchCreationResponse)) {
				logger.info("FAILURE"+branchCreationResponse);
				map.put("message", branchCreationResponse);
				map.put("status", branchCreationResponse);
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
			} else {
				logger.info("message & status"+branchCreationResponse);
				map.put("status", branchCreationResponse);
				map.put("message", branchCreationResponse);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
			}

		} catch (Exception e) {
			logger.error("Exception in createBranch"+e);
			map.put("status", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}

	}

	@GetMapping("/BranchesByCompanyCode/{companyCode}")
	public ResponseEntity<Map<String, Object>> getBranchesBycompanyCode(@PathVariable String companyCode) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			List<BranchMap> branchList = companyRegisterService.getBranchesByCompanyCode(companyCode);
			if (branchList != null) {

				logger.info("SUCCESS data"+branchList);
				
				map.put("status", "SUCCESS");
				map.put("data", branchList);
				return ResponseEntity.ok(map);
			} else {
				logger.info("FAILURE data"+branchList);
				
				map.put("status", "FAILURE");
				map.put("data", branchList);

				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);
			}
		} catch (Exception e) {
			logger.error("Exception in getBranchesBycompanyCode"+e);
			map.put("status", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
		}
	}
	
	@GetMapping("/company/logo/{companyCode}")
	public ResponseEntity<byte[]> getCompanyLogo(@PathVariable String companyCode) {
		return companyRegisterService.findByCompanyDetails_CompanyCode(companyCode);

	}
}
