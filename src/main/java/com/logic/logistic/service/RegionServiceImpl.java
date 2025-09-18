package com.logic.logistic.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.model.BranchNameList;
import com.logic.logistic.repository.RegionMasterRepository;

@Service
public class RegionServiceImpl<E> implements  RegionService{
	
	@Autowired
	private RegionMasterRepository RegionMasterRepository;

	@Override
	public List<String> getRegionListByCompanyCode(String companyCode) {
		// TODO Auto-generated method stub
		return RegionMasterRepository.findDistinctRegionByCompanyCode(companyCode);
	}

	@Override
	public List<String> getSubRegionListByRegion(String region) {
		// TODO Auto-generated method stub
		return RegionMasterRepository.findDistinctSubRegionByRegion(region);
	}

	@Override
	public List<String> getBranchesListBySubregion(String region, String subRegion) {
		 List<BranchNameList> findBranchData = RegionMasterRepository.findBranchData(region, subRegion);
		List<String> list = new ArrayList<>();
		for (BranchNameList row : findBranchData) {
		    String branchCode = row.getBranchCode();
		    String branchName = row.getBranchName();
		    list.add(branchName+"-"+branchCode);
		}
		return list;
	}

}
