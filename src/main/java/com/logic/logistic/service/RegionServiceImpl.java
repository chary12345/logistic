package com.logic.logistic.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.RegionMasterDto;
import com.logic.logistic.dto.RegionSearchDTO;
import com.logic.logistic.model.BranchNameList;
import com.logic.logistic.repository.RegionMasterRepository;

@Service
public class RegionServiceImpl<E> implements  RegionService{
	
	@Autowired
	private RegionMasterRepository repo;

	@Override
	public List<String> getRegionListByCompanyCode(String companyCode) {
		// TODO Auto-generated method stub
		return repo.findDistinctRegionByCompanyCode(companyCode);
	}

	@Override
	public List<String> getSubRegionListByRegion(String region) {
		// TODO Auto-generated method stub
		return repo.findDistinctSubRegionByRegion(region);
	}

	@Override
	public List<String> getBranchesListBySubregion(String region, String subRegion) {
		 List<BranchNameList> findBranchData = repo.findBranchData(region, subRegion);
		List<String> list = new ArrayList<>();
		for (BranchNameList row : findBranchData) {
		    String branchCode = row.getBranchCode();
		    String branchName = row.getBranchName();
		    list.add(branchName+"-"+branchCode);
		}
		return list;
	}
	
	
//	public List<RegionSearchDTO> search(String fromDate, String toDate, String region, String subRegion, String branch){
//		try {
//            LocalDateTime from = LocalDate.parse(fromDate).atStartOfDay();
//            LocalDateTime to = LocalDate.parse(toDate).atTime(23, 59, 59);
//            
//            System.out.println("Region search filters: from=" + from + ", to=" + to +
//            	    ", region=" + region + ", subRegion=" + subRegion + ", branch=" + branch);
//
//            return repo.searchRegions(from, to, region, subRegion, branch);
//        } catch (Exception e) {
//            e.printStackTrace(); // You can replace this with proper logging
//            return Collections.emptyList();
//        }		
//	}

	public List<RegionSearchDTO> getGlobalSearchResults(LocalDateTime from, LocalDateTime to, String region, String subRegion, String branch) {
		try {
			return repo.searchRegions(from, to, region, subRegion, branch);
		} catch (Exception e) {
			System.out.println("ERROR IN SEARCH: " + e.getMessage());
			e.printStackTrace(); // You can replace this with proper logging
            return Collections.emptyList();
		}
		
	}

}
