package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.logic.logistic.model.*;
import com.logic.logistic.service.ArticleTypeService;
import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.BookingSearchRequest;
import com.logic.logistic.service.BookingService;

@RestController
@RequestMapping("/api/bookings")

public class BookingController {

	@Autowired
	private BookingService bookingService;

	@Autowired
	private ArticleTypeService articleTypeService;

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@PostMapping("/bookLoad")
	public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingDTO dto) {
		BookingResponseDTO bookingResponseDTO = bookingService.saveBooking(dto);
		return ResponseEntity.ok(bookingResponseDTO);
	}

	@PutMapping("/updateBookLoad")
	public ResponseEntity<?> updateBooking(@RequestParam String lr, @RequestBody BookingDTO dto) {
	        try {
	            BookingResponseDTO bookingUpdated = bookingService.updateBooking(lr, dto);
	            return ResponseEntity.ok(bookingUpdated);
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed: " + e.getMessage());
	        }
	    }
	

	@GetMapping("/report")
	public ResponseEntity<BookingPageResponse> getReport(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
			@RequestParam String status, @RequestParam(required = false) String lastId,
			@RequestParam(required = false) String branchCode) {
		BookingPageResponse response = bookingService.getReports(fromDate, toDate, status, lastId, branchCode);
		return ResponseEntity.ok(response);
	}
	
	@PostMapping("/dispatchLoad")
	public ResponseEntity<DispatchResponse> dispatchLoad(@RequestBody DispatchRequest request) {
	    DispatchResponse result = bookingService.dispatchLoad(request);
	    return ResponseEntity.ok(result);
	}
	@GetMapping("/searchBylr")
	public ResponseEntity<?> searchByLR(@RequestParam String lr) {
		try {
			BookingDTO dto = bookingService.findByLoadingReciept(lr);

			if (dto != null) {

				return ResponseEntity.ok(dto);
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No record found");
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
		}
	}


	@PostMapping("/get-Global-Search-Reports")
	public ResponseEntity<BookingPageResponse> getGlobalSearchReports(@RequestBody BookingSearchRequest request) {
	    BookingPageResponse response = bookingService.getGlobalSearchReports(request);
	    return ResponseEntity.ok(response);
	}

	 @GetMapping("Get-distinct-saidtocontains/{companyCode}")
	    public List<String> getSaidToContainsByCompany(@PathVariable String companyCode) {
	        return bookingService.getSaidToContainsByCompany(companyCode);
	    }


	@PostMapping("/createArticleType")
	public ResponseEntity<ArticleTypeResponse> createArticleType(
			@RequestBody ArticleTypeRequest request) {

		return ResponseEntity.ok(articleTypeService.create(request));
	}


	@GetMapping("/fetchArticleTypeList")
	public ResponseEntity<List<String>> getByCompany(
			@RequestParam String companyCode) {

		return ResponseEntity.ok(articleTypeService.getByCompany(companyCode));
	}
}