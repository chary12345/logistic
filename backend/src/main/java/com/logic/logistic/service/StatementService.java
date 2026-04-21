package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.List;

import com.logic.logistic.model.TbbStatementResponse;
import com.logic.logistic.model.TbbSummaryRequest;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.StatementDto;

@Service
public interface StatementService {

	List<StatementDto> getStatements(String branchCode, LocalDateTime fromDate, LocalDateTime toDate, String paymentMode);

    TbbStatementResponse getTbbStatement(TbbSummaryRequest request);
}
