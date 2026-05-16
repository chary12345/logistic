package com.logic.logistic.service;

import java.util.List;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.DispatchedResponseDTO;
import com.logic.logistic.dto.ReceiveRequest;
import com.logic.logistic.model.OperationFilter;

public interface OperationService {

	List<Booking> getBookingsWithFilter(OperationFilter filter);
	DispatchedResponseDTO disaptchedListByLsORVehicleNumber(Long lsId, String vehicleNo);
	void receiveSelectedLrs(ReceiveRequest request);

	List<Booking> getReceivedLrsForDelivery(String destinationBranchCode, String lrNumber);

	void deliverSelectedLrs(List<String> lrIds);
}
