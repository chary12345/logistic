package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.BookingReceiptSequence;

@Repository
public interface BookingReceiptSequenceRepository extends JpaRepository<BookingReceiptSequence, String> {
}
