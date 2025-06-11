package com.logic.logistic.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.Booking;


@Repository
public interface BookRepository extends JpaRepository<Booking, String> {
	Page<Booking> findByBookingDateBetween(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
}