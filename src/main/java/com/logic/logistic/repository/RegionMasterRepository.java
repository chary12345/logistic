package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.RegionMasterDto;
import com.logic.logistic.dto.RegionMasterId;

@Repository
public interface RegionMasterRepository extends JpaRepository<RegionMasterDto, RegionMasterId> {

	@Query("SELECT DISTINCT b.id.region FROM RegionMasterDto b WHERE b.companyCode = :companyCode")
	List<String> findDistinctRegionByCompanyCode(String companyCode);

    @Query("SELECT DISTINCT b.id.subRegion FROM RegionMasterDto b WHERE b.id.region = :region")
    List<String> findDistinctSubRegionByRegion(String region);

    @Query("SELECT DISTINCT b.id.branch FROM RegionMasterDto b WHERE b.id.region = :region AND b.id.subRegion = :subRegion")
    List<String> findDistinctBranchByRegionAndSubRegion(String region, String subRegion);
}
