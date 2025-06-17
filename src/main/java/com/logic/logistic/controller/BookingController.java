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
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private BookingService bookingService;

    @PostMapping("/bookLoad")
    public ResponseEntity<Booking> createBooking(@RequestBody BookingDTO dto) {
        Booking saved = bookingService.saveBooking(dto);
        return ResponseEntity.ok(saved);
    }

	/*
	 * @PostMapping("/bookLoad") public ResponseEntity<?> bookLoad(@RequestBody
	 * Booking booking) { LoadRecieptPojo LrPojo=new LoadRecieptPojo();
	 * LrPojo.setCompanyCode("UNIQ"); LrPojo.setBranchCode("DIUNIQ");
	 * LrPojo.setLastNumber(1); String generateReceiptNumber =
	 * GenerateUtils.generateReceiptNumber(LrPojo);
	 * booking.setLoadingReciept(generateReceiptNumber);
	 * booking.setBookingDate(LocalDateTime.now()); // Set the current date return
	 * ResponseEntity.ok(bookRepository.save(booking)); }
	 */
	/*
	 * @PostMapping("/fetchLoadReciept") public ResponseEntity<?>
	 * getLoadReciet(@RequestBody LoadRecieptPojo LrPojo) {
	 * 
	 * String generateReceiptNumber = GenerateUtils.generateReceiptNumber(LrPojo);
	 * return ResponseEntity.ok(generateReceiptNumber); }
	 */

    @GetMapping("/report")
    public ResponseEntity<?> getBookingReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime toDate) {
        return ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate, toDate));
    }
    
    @GetMapping("/todayReports")
    public ResponseEntity<?> toDayBookingRepoprts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDateTime toDate) {
        return ResponseEntity.ok(bookingService.getBookingReportsBetweenDates(fromDate, toDate));
    }
    @PostMapping("/dispatchLoad")
    public ResponseEntity<List<Booking>> dispatchLoad(@RequestBody List<String> loadingReceipts) {
       List<Booking> dispatchLoad = bookingService.dispatchLoad(loadingReceipts);
        return ResponseEntity.ok(dispatchLoad);
    }
}