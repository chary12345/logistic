package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.BranchId;
import com.logic.logistic.dto.BranchMaster;


@Repository
public interface BranchMasterRepo extends JpaRepository<BranchMaster, BranchId> {
	
	@Query("SELECT DISTINCT b.region FROM BranchMaster b")
    List<String> findDistinctRegion();

    @Query("SELECT DISTINCT b.subRegion FROM BranchMaster b WHERE b.region = :region")
    List<String> findDistinctSubRegionByRegion(String region);

    @Query("SELECT DISTINCT b.branch FROM BranchMaster b WHERE b.region = :region AND b.subRegion = :subRegion")
    List<String> findDistinctBranchByRegionAndSubRegion(String region, String subRegion);

}