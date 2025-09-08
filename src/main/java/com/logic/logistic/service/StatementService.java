package com.logic.logistic.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.logic.logistic.dto.StatementDto;

@Service
public interface StatementService {

	List<StatementDto> getStatements(String branchCode, LocalDate fromDate, LocalDate toDate, String paymentMode);
}
