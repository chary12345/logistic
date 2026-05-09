package com.logic.logistic.repository;

import com.logic.logistic.dto.BookingChargeDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingChargeDetailsRepo
        extends JpaRepository<BookingChargeDetails, Long> {

    void deleteByLoadingReciept(String loadingReciept);

    Optional<BookingChargeDetails> findByLoadingReciept(
            String loadingReciept
    );
}