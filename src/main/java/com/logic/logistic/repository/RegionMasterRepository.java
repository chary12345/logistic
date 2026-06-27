package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.logic.logistic.dto.RegionMasterDto;
import com.logic.logistic.dto.RegionMasterId;
import com.logic.logistic.model.BranchNameList;

@Repository
public interface RegionMasterRepository extends JpaRepository<RegionMasterDto, RegionMasterId> {

	@Query("SELECT DISTINCT b.id.region FROM RegionMasterDto b WHERE b.companyCode = :companyCode")
	List<String> findDistinctRegionByCompanyCode(String companyCode);

	@Query("SELECT DISTINCT b.id.subRegion FROM RegionMasterDto b WHERE b.id.region = :region")
	List<String> findDistinctSubRegionByRegion(String region);

	@Query("SELECT DISTINCT b.id.branchCode FROM RegionMasterDto b WHERE b.id.region = :region")
	List<String> findBranchCodesByRegion(String region);

	@Query("SELECT DISTINCT b.id.branchCode FROM RegionMasterDto b WHERE b.id.region = :region AND b.id.subRegion = :subRegion")
	List<String> findBranchCodesByRegionAndSubRegion(String region, String subRegion);

	@Query("SELECT new com.logic.logistic.model.BranchNameList(b.id.branchCode, b.branch) "
			+ "FROM RegionMasterDto b " + "WHERE b.id.region = :region AND b.id.subRegion = :subRegion")
	List<BranchNameList> findBranchData(String region, String subRegion);

	/** Find all region records for a given branch code */
	@Query("SELECT r FROM RegionMasterDto r WHERE r.id.branchCode = :branchCode")
	List<RegionMasterDto> findAllByBranchCode(String branchCode);

	/** Native bulk delete to remove region_master rows for a branch */
	@Modifying
	@Transactional
	@Query(value = "DELETE FROM region_master WHERE branch_code = :branchCode", nativeQuery = true)
	void deleteByBranchCode(String branchCode);
}
