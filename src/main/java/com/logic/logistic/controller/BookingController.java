package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.List;

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
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.model.BookingPageResponse;
import com.logic.logistic.service.BookingService;

@RestController
@RequestMapping("/api/bookings")

public class BookingController {

	@Autowired
	private BookingService bookingService;

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@PostMapping("/bookLoad")
	public ResponseEntity<Booking> createBooking(@RequestBody BookingDTO dto) {
		Booking saved = bookingService.saveBooking(dto);
		return ResponseEntity.ok(saved);
	}

	 @PutMapping("/bookLoad/{lr}")
	    public ResponseEntity<?> updateBooking(@PathVariable String lr, @RequestBody BookingDTO dto) {
	        try {
	            Booking bookingUpdated = bookingService.updateBooking(lr, dto);
	            return ResponseEntity.ok(bookingUpdated);
	        } catch (Exception e) {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed: " + e.getMessage());
	        }
	    }
	// @GetMapping("/report")
	public ResponseEntity<?> getBookingReport(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime toDate,
			@RequestParam(required = false) String status) {
		return ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate, toDate, status));
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

	@GetMapping("/todayReports")
	public ResponseEntity<?> toDayBookingRepoprts(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime toDate, String status) {
		return ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate, toDate, status));
	}

	@PostMapping("/dispatchLoad")
	public ResponseEntity<List<Booking>> dispatchLoad(@RequestBody List<String> loadingReceipts) {
		List<Booking> dispatchLoad = bookingService.dispatchLoad(loadingReceipts);
		return ResponseEntity.ok(dispatchLoad);
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

}