package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.logic.logistic.model.TbbStatementResponse;
import com.logic.logistic.model.TbbSummaryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.logic.logistic.dto.StatementDto;
import com.logic.logistic.dto.TbbInvoiceDTO;
import com.logic.logistic.model.TbbInvoiceRequest;
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

	@PostMapping("/tbb/statement")
	public ResponseEntity<TbbStatementResponse> getStatement(
			@RequestBody TbbSummaryRequest request) {

		return ResponseEntity.ok(statementService.getTbbStatement(request));
	}

    @PostMapping("/tbb/invoice/generate")
    public ResponseEntity<String> generateTbbInvoice(@RequestBody TbbInvoiceRequest request) {
        String invoiceNumber = statementService.generateTbbInvoice(
            request.getLrIds(), request.getConsignorName(), request.getFromBranch(), request.getTotalAmount());
        return ResponseEntity.ok(invoiceNumber);
    }

    @GetMapping("/tbb/invoices")
    public ResponseEntity<List<TbbInvoiceDTO>> getTbbInvoices(
            @RequestParam String branchCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(statementService.getTbbInvoices(branchCode, fromDate, toDate));
    }

    @GetMapping("/tbb/invoices/search")
    public ResponseEntity<List<TbbInvoiceDTO>> searchTbbInvoices(
            @RequestParam String branchCode,
            @RequestParam(required = false) String invoiceNumber,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(statementService.searchTbbInvoices(branchCode, invoiceNumber, fromDate, toDate));
    }

    @GetMapping("/tbb/invoice/{invoiceId}/lrs")
    public ResponseEntity<List<com.logic.logistic.model.LrStatementDTO>> getTbbInvoiceLrDetails(
            @PathVariable Long invoiceId) {
        return ResponseEntity.ok(statementService.getTbbInvoiceLrDetails(invoiceId));
    }

    @PostMapping("/tbb/invoice/{invoiceId}/add-lr")
    public ResponseEntity<Void> addLrToInvoice(
            @PathVariable Long invoiceId,
            @RequestParam String lrNumber) {
        statementService.addLrToInvoice(invoiceId, lrNumber);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tbb/invoice/{invoiceId}/remove-lr")
    public ResponseEntity<Void> removeLrFromInvoice(
            @PathVariable Long invoiceId,
            @RequestParam String lrNumber) {
        statementService.removeLrFromInvoice(invoiceId, lrNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tbb/invoice/cancel/{invoiceId}")
    public ResponseEntity<Void> cancelTbbInvoice(@PathVariable Long invoiceId) {
        statementService.cancelTbbInvoice(invoiceId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tbb/invoice/settle/{invoiceId}")
    public ResponseEntity<Void> settleTbbInvoice(@PathVariable Long invoiceId) {
        statementService.settleTbbInvoice(invoiceId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tbb/bill-report")
    public ResponseEntity<List<TbbInvoiceDTO>> getTbbBillReport(
            @RequestParam(required = false) String branchCode,
            @RequestParam(defaultValue = "false") boolean allBranches,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(statementService.getTbbBillReport(branchCode, allBranches, fromDate, toDate));
    }
}
