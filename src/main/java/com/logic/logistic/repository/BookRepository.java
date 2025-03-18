package com.logic.logistic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.model.Booking;

@Repository
public interface BookRepository extends JpaRepository<Booking, Long>{

}
