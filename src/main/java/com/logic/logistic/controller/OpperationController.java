package com.logic.logistic.controller;

import java.util.List;

import com.logic.logistic.dto.DispatchedResponseDTO;
import com.logic.logistic.dto.ReceiveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

	@GetMapping("/disaptchedList")
	public ResponseEntity<DispatchedResponseDTO> disaptchedListByLsORVehicleNumber(
			@RequestParam(required = false) Long lsId,
			@RequestParam(required = false) String vehicleNo) {

		DispatchedResponseDTO result = operationService.disaptchedListByLsORVehicleNumber(lsId, vehicleNo);
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/loadingSheet/list")
	public ResponseEntity<?> getLoadingSheets(
	    @RequestParam String companyCode,
	    @RequestParam String destinationBranch){

	    return ResponseEntity.ok(
	    		operationService.getLoadingSheetList(
	                companyCode,
	                destinationBranch
	            )
	    );
	}

	@PostMapping("/receive")
	public ResponseEntity<String> receiveSelectedLrs(@RequestBody ReceiveRequest request) {
		operationService.receiveSelectedLrs(request);
		return ResponseEntity.ok("Selected LRs received successfully");
	}

	@GetMapping("/fetchReceivedLrs")
	public ResponseEntity<List<Booking>> getReceivedLrs(
			@RequestParam String destinationBranchCode,
			@RequestParam(required = false) String lrNumber) {

		return ResponseEntity.ok(
				operationService.getReceivedLrsForDelivery(destinationBranchCode, lrNumber)
		);
	}

	@PostMapping("/deliverLrs")
	public ResponseEntity<String> deliverLrs(
			@RequestBody List<String> lrIds) {

		operationService.deliverSelectedLrs(lrIds);

		return ResponseEntity.ok("LRs delivered successfully");
	}
}
