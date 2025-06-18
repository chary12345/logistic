package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	@Autowired
	private BookingService bookingService;

	@PostMapping("/bookLoad")
	public ResponseEntity<Booking> createBooking(@RequestBody BookingDTO dto) {
		Booking saved = bookingService.saveBooking(dto);
		return ResponseEntity.ok(saved);
	}

	@GetMapping("/report")
	public ResponseEntity<?> getBookingReport(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime fromDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime toDate,
			@RequestParam(required = false) String status) {
		return ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate, toDate, status));
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
}