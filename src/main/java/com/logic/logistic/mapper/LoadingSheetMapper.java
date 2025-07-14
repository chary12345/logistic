package com.logic.logistic.mapper;

import java.time.LocalDateTime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logic.logistic.dto.LoadingSheetDTO;
import com.logic.logistic.model.DispatchRequest;

public class LoadingSheetMapper {
	public static LoadingSheetDTO fromRequest(DispatchRequest request) throws JsonProcessingException {
		LoadingSheetDTO ls = new LoadingSheetDTO();
        ls.setVehicleNumber(request.getVehicleNumber());
        ls.setVehicleName(request.getVehicleName());
        ls.setDestinationBranch(request.getDestinationBranch());
        ls.setDriverName(request.getDriverName());
        ls.setDriverPhone(request.getDriverPhone());
        ls.setCreatedAt(LocalDateTime.now());
        // Convert List<String> to JSON string using ObjectMapper
        ObjectMapper mapper = new ObjectMapper();
        String lrJson = mapper.writeValueAsString(request.getLrIds());
        ls.setLrIdsJson(lrJson);

        return ls;
    }
}
