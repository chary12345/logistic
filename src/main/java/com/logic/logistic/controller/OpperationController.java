package com.logic.logistic.controller;

import java.util.List;
import java.util.Map;

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
		return operationService.getBookingsWithFilter(filter);
	}

	@GetMapping("/disaptchedList")
	public ResponseEntity<DispatchedResponseDTO> disaptchedListByLsORVehicleNumber(
			@RequestParam(required = false) Long lsId,
			@RequestParam(required = false) String vehicleNo) {
		return ResponseEntity.ok(operationService.disaptchedListByLsORVehicleNumber(lsId, vehicleNo));
	}
	
	@GetMapping("/dispatchedListByBranch")
	public ResponseEntity<List<DispatchedResponseDTO>> getDispatchedListByBranch(
			@RequestParam String destinationBranch,@RequestParam String fromBranch) {
		return ResponseEntity.ok(operationService.getDispatchedListByBranch(destinationBranch,fromBranch));
	}

	@GetMapping("/loadingSheet/list")
	public ResponseEntity<?> getLoadingSheets(
	    @RequestParam String companyCode,
	    @RequestParam String destinationBranch){
	    return ResponseEntity.ok(
	    		operationService.getLoadingSheetList(companyCode, destinationBranch)
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
	public ResponseEntity<String> deliverLrs(@RequestBody List<String> lrIds) {
		operationService.deliverSelectedLrs(lrIds);
		return ResponseEntity.ok("LRs delivered successfully");
	}

	// ── LS management endpoints ─────────────────────────────────────────────

	/** Search a single LS by its number — returns LS + all associated LRs */
	@GetMapping("/ls/search")
	public ResponseEntity<DispatchedResponseDTO> searchLSByNumber(@RequestParam Long lsNumber) {
		return ResponseEntity.ok(operationService.searchLSByNumber(lsNumber));
	}

	/** Cancel (soft-delete) LS — reverts all LRs to BOOKED */
	@DeleteMapping("/ls/{lsId}")
	public ResponseEntity<String> cancelLS(@PathVariable Long lsId) {
		operationService.cancelLS(lsId);
		return ResponseEntity.ok("LS cancelled successfully");
	}

	/** Edit LR details within an LS — update unloading branch */
	@PutMapping("/ls/{lsId}/lr")
	public ResponseEntity<String> editLrInLS(
			@PathVariable Long lsId,
			@RequestParam String lrId,
			@RequestBody Map<String, String> body) {
		operationService.editLrInLS(lsId, lrId,
				body.get("unloadingBranch"),
				body.get("vehicleNumber"));
		return ResponseEntity.ok("LR updated successfully");
	}

	/** Remove LR from LS — reverts LR to BOOKED */
	@DeleteMapping("/remove/ls/{lsId}/lr")
	public ResponseEntity<String> removeLrFromLS(
			@PathVariable Long lsId,
			@RequestParam String lrId) {
		operationService.removeLrFromLS(lsId, lrId);
		return ResponseEntity.ok("LR removed from LS");
	}

	/** Add a BOOKED LR to an existing LS */
	@PostMapping("/add/ls/{lsId}/lr")
	public ResponseEntity<String> addLrToLS(
			@PathVariable Long lsId,
			@RequestParam String lrId) {
		operationService.addLrToLS(lsId, lrId);
		return ResponseEntity.ok("LR added to LS");
	}
}
