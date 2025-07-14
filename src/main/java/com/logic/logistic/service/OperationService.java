package com.logic.logistic.service;

import java.util.List;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.model.OperationFilter;

public interface OperationService {

	List<Booking> getBookingsWithFilter(OperationFilter filter);

}
