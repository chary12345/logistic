package com.logic.logistic.mapper;

import com.logic.logistic.dto.VehicleDTO;
import com.logic.logistic.model.VehicleRequest;

public class VehicleMapper {

	public static VehicleDTO toEntity(VehicleRequest req) {
		VehicleDTO v = new VehicleDTO();
        v.setCompanyCode(req.getCompanyCode());
        v.setTruckNumber(req.getTruckNumber());
        v.setVehicleName(req.getVehicleName());
        v.setCapacity(req.getCapacity());
        v.setOwnerName(req.getOwnerName());
        v.setVehicleType(req.getVehicleType());
        v.setBranchCode(req.getBranchCode());
        v.setRcNumber(req.getRcNumber());
        v.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
        return v;
    }
}
