package com.logic.logistic.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.logic.logistic.dto.RegionSearchDTO;

public interface RegionService {

	List<String> getRegionListByCompanyCode(String companyCode);

	List<String> getSubRegionListByRegion(String region);

	List<String> getBranchesListBySubregion(String region, String subRegion);

//	List<RegionSearchDTO> search(String fromDate, String toDate, String region, String subRegion, String branch);
	

}
