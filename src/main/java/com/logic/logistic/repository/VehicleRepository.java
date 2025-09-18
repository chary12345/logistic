package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.VehicleDTO;

@Repository
public interface VehicleRepository extends JpaRepository<VehicleDTO, String> {
    boolean existsByTruckNumber(String truckNumber);

	List<VehicleDTO> findByBranchCodeAndIsActive(String branchCode, boolean b);
}