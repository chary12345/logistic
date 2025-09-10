package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.StatementDto;
import com.logic.logistic.service.StatementService;

@RestController
@RequestMapping("/statement")
public class StatementController {

	@Autowired
	private StatementService statementService;

	@GetMapping("/report")
	public ResponseEntity<List<StatementDto>> getStatements(@RequestParam String branchCode,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
			@RequestParam(required = false) String paymentMode) {
		return ResponseEntity.ok(statementService.getStatements(branchCode, fromDate, toDate, paymentMode));
	}

}
