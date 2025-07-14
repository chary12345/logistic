package com.logic.logistic.service;

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
		List<Booking> findBookingsByFilter = bookingRepository.findBookingsByFilter(filter.getFromDate(), filter.getToDate(), filter.getRegion(),
				filter.getSubregion(), filter.getBranchCode(), filter.getEmployeeName(), filter.getStatus());
	
		return findBookingsByFilter;
	}

}
