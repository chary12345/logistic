package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.model.OperationFilter;
import com.logic.logistic.repository.BookRepository;

@Service
public class OperationServiceImpl implements OperationService {

	@Autowired
	private BookRepository bookingRepository;
	
	@Override
	public List<Booking> getBookingsWithFilter(OperationFilter filter) {
		LocalDateTime from = null;
		LocalDateTime to = null ;
		if(filter.getFromDate()!=null)
		 from = toDateTime(filter.getFromDate());
		if(filter.getToDate()!=null)
		 to = toDateTime(filter.getToDate());
	  List<Booking> findByBookingDateBetween = bookingRepository.findByBookingDateBetween(from, to, "BOOKED",filter.getBranchCode());
	
		return findByBookingDateBetween;
	}

	public static LocalDateTime toDateTime(String input) {
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
	    return LocalDateTime.parse(input, formatter);
	}
}
