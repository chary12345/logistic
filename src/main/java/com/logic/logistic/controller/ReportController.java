package com.logic.logistic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.service.RegionService;

@RestController
@RequestMapping("/region")
public class ReportController {

	@Autowired
	private RegionService regionService;
	
	@GetMapping("/regions")
	public List<String> regions(@RequestParam String companyCode) {
		return regionService.getRegionListByCompanyCode(companyCode);
	}

	@GetMapping("/subregions")
	public List<String> subregions(@RequestParam String region) {
		return regionService.getSubRegionListByRegion(region);
	}

	@GetMapping("/branches")
	public List<String> branches(@RequestParam String region, @RequestParam String subRegion) {
		return regionService.getBranchesListBySubregion(region, subRegion);
	}

}