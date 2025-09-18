package com.logic.logistic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.VehicleDTO;
import com.logic.logistic.mapper.VehicleMapper;
import com.logic.logistic.model.VehicleRequest;
import com.logic.logistic.repository.VehicleRepository;

@RestController
@RequestMapping("/vehicles")
public class VehileManageController {

	@Autowired
	private VehicleRepository vehicleRepository;

	@PostMapping("/associate")
	public ResponseEntity<String> associateVehicle(@RequestBody VehicleRequest request) {
		String status = null;
		try {
			if (vehicleRepository.existsByTruckNumber(request.getTruckNumber())) {
				return ResponseEntity.status(HttpStatus.CONFLICT).body("Truck number already exists.");
			}
			vehicleRepository.save(VehicleMapper.toEntity(request));
			status = "Vehicle associated successfully.";

		} catch (Exception e) {
			status = e.getLocalizedMessage();
		}
		return ResponseEntity.ok(status);
	}
	
	@GetMapping("/active")
	public ResponseEntity<List<VehicleDTO>> getActiveVehicles(@RequestParam String branchCode) {
	    List<VehicleDTO> activeVehicles = vehicleRepository.findByBranchCodeAndIsActive(branchCode, true);
	    return ResponseEntity.ok(activeVehicles);
	}

}
