package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.model.BookingModel;

@Repository
public interface BookingRepository extends JpaRepository<BookingModel, String>{

}
