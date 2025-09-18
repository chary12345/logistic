package com.logic.logistic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.model.OperationFilter;
import com.logic.logistic.service.OperationService;

@RestController
@RequestMapping("/operation")
public class OpperationController {

	@Autowired
	private OperationService operationService;
	
	@PostMapping("/bookingList")
	public List<Booking> getFilteredReport(@RequestBody OperationFilter filter) {
		List<Booking> bookingsWithFilter = operationService.getBookingsWithFilter(filter);
	    return bookingsWithFilter;
	}
}
