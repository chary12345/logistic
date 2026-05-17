package com.logic.logistic.service;

import java.util.List;

public interface RegionService {

	List<String> getRegionListByCompanyCode(String companyCode);

	List<String> getSubRegionListByRegion(String region);

	List<String> getBranchesListBySubregion(String region, String subRegion);

}
