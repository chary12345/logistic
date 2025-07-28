package com.logic.logistic.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.Booking;
import com.logic.logistic.dto.RegionSearchDTO;
import com.logic.logistic.model.BookingDTO;
import com.logic.logistic.model.BranchNameList;
import com.logic.logistic.repository.BookRepository;
import com.logic.logistic.repository.RegionMasterRepository;

@Service
public class RegionServiceImpl<E> implements  RegionService{
	
	@Autowired
	private RegionMasterRepository repo;
	
	@Autowired
	private BookRepository bookrepo;

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
	
	// ✅ New method to get bookings based on region filters
//    public List<Booking> getBookingDataByRegion(LocalDateTime from, LocalDateTime to,
//                                                String region, String subRegion, String branch) {
//        try {
//            List<RegionSearchDTO> regions = repo.searchRegions(from, to, region, subRegion, branch);
//
//            if (regions.isEmpty()) {
//                return Collections.emptyList();
//            }
//
//            List<String> branchCodes = regions.stream()
//                    .map(RegionSearchDTO::getBranchCode)
//                    .filter(Objects::nonNull)
//                    .map(String::toUpperCase) // assuming booking.branchCode is stored in uppercase
//                    .distinct()
//                    .collect(Collectors.toList());
//
//            return repo.findByBranchCodeIn(branchCodes);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return Collections.emptyList();
//        }
//    }
    
    public List<BookingDTO> getBookingDataByBranchAndDate(String branchCombo, LocalDate from, LocalDate to) {
        try {
            // Extract actual branch code from combo string like "PITAPURAM-PISENA"
            String branchCode = branchCombo.contains("-") ? branchCombo.split("-")[1] : branchCombo;

            LocalDateTime fromDateTime = from.atStartOfDay();
            LocalDateTime toDateTime = to.atTime(23, 59, 59);

            return bookrepo.findBookingsByBranchAndDateRange(branchCode, fromDateTime, toDateTime);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }


}
