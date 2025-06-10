package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.Booking;

import java.util.Date;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Booking, String> {

    List<Booking> findByBookingDateBetween(Date fromDate, Date toDate);
}