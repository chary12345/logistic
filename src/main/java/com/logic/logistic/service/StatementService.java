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

    String generateTbbInvoice(java.util.List<String> lrIds, String consignorName, String fromBranch, Double totalAmount);

    List<com.logic.logistic.dto.TbbInvoiceDTO> getTbbInvoices(String fromBranch, LocalDateTime fromDate, LocalDateTime toDate);

    List<com.logic.logistic.dto.TbbInvoiceDTO> searchTbbInvoices(String branchCode, String invoiceNumber, LocalDateTime fromDate, LocalDateTime toDate);

    List<com.logic.logistic.model.LrStatementDTO> getTbbInvoiceLrDetails(Long invoiceId);

    void addLrToInvoice(Long invoiceId, String lrNumber);

    void removeLrFromInvoice(Long invoiceId, String lrNumber);

    void cancelTbbInvoice(Long invoiceId);

    void settleTbbInvoice(Long invoiceId);

    List<com.logic.logistic.dto.TbbInvoiceDTO> getTbbBillReport(String branchCode, boolean allBranches, String companyCode, LocalDateTime fromDate, LocalDateTime toDate);
}
