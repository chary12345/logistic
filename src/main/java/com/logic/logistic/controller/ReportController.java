package com.logic.logistic.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logic.logistic.dto.SearchCriteria;
import com.logic.logistic.model.LRPS;
import com.logic.logistic.repository.BranchMasterRepo;
import com.logic.logistic.repository.LRPSRepo;

@RestController
@RequestMapping("/api")
public class ReportController {
	
	@Autowired BranchMasterRepo branchRepo;
    @Autowired LRPSRepo lrpsRepo;

    @GetMapping("/regions")
    public List<String> regions() {
        return branchRepo.findDistinctRegion();
    }

    @GetMapping("/subregions")
    public List<String> subregions(@RequestParam String region) {
        return branchRepo.findDistinctSubRegionByRegion(region);
    }

    @GetMapping("/branches")
    public List<String> branches(@RequestParam String region, @RequestParam String subRegion) {
        return branchRepo.findDistinctBranchByRegionAndSubRegion(region, subRegion);
    }

    @PostMapping("/lr-paid-statement/search")
    public List<LRPS> search(@RequestBody SearchCriteria c) {
        return lrpsRepo.search(c.getFrom(), c.getTo(), c.getRegion(), c.getSubRegion(), c.getBranch());
    }

}
