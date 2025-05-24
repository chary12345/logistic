package com.logic.logistic.controller;

import java.time.LocalDateTime;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.model.Booking;
import com.logic.logistic.repository.BookRepository;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    

    @Autowired
    private BookRepository bookRepository;

    @PostMapping("/bookLoad")
    public ResponseEntity<?> bookLoad(@RequestBody Booking booking) {
        booking.setBookingDate(LocalDateTime.now()); // Set the current date
        return ResponseEntity.ok(bookRepository.save(booking));
    }

    

    @GetMapping("/report")
    public ResponseEntity<?> getBookingReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date toDate) {
        return ResponseEntity.ok(bookRepository.findByBookingDateBetween(fromDate, toDate));
    }
}