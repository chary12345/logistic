package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.logic.logistic.dto.StatementDto;

@Service
public interface StatementService {

	List<StatementDto> getStatements(String branchCode, LocalDateTime fromDate, LocalDateTime toDate, String paymentMode);
}
