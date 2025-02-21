package com.logic.logistic.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.model.BookingModel;
import com.logic.logistic.repository.BookingRepository;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired private BookingRepository bookingRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingModel booking) {
        booking.setTrackingId(UUID.randomUUID().toString());
        booking.setStatus("Booked");
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<?> trackBooking(@PathVariable String trackingId) {
        return ResponseEntity.ok(bookingRepository.findById(trackingId));
    }
}
