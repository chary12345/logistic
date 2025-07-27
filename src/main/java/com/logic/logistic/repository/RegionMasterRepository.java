package com.logic.logistic.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.RegionMasterDto;
import com.logic.logistic.dto.RegionMasterId;
import com.logic.logistic.dto.RegionSearchDTO;
import com.logic.logistic.model.BranchNameList;

@Repository
public interface RegionMasterRepository extends JpaRepository<RegionMasterDto, RegionMasterId> {

	@Query("SELECT DISTINCT b.id.region FROM RegionMasterDto b WHERE b.companyCode = :companyCode")
	List<String> findDistinctRegionByCompanyCode(String companyCode);

	@Query("SELECT DISTINCT b.id.subRegion FROM RegionMasterDto b WHERE b.id.region = :region")
	List<String> findDistinctSubRegionByRegion(String region);

	@Query("SELECT new com.logic.logistic.model.BranchNameList(b.id.branchCode, b.branch) "
			+ "FROM RegionMasterDto b " + "WHERE b.id.region = :region AND b.id.subRegion = :subRegion")
	List<BranchNameList> findBranchData(String region, String subRegion);
	
//	@Query("SELECT new com.logic.logistic.dto.RegionSearchDTO(...) FROM RegionMaster rm " +
//		       "WHERE rm.createDate BETWEEN :from AND :to " +
//		       "AND (:region IS NULL OR LOWER(rm.state) = LOWER(:region)) " +
//		       "AND (:subRegion IS NULL OR LOWER(rm.city) = LOWER(:subRegion)) " +
//		       "AND (:branch IS NULL OR LOWER(rm.branchCode) = LOWER(:branch))")
//		List<RegionSearchDTO> search(@Param("from") LocalDateTime from,
//		                             @Param("to") LocalDateTime to,
//		                             @Param("region") String region,
//		                             @Param("subRegion") String subRegion,
//		                             @Param("branch") String branch);


	
	@Query("SELECT new com.logic.logistic.dto.RegionSearchDTO(" +
	           "LOWER(TRIM(r.id.region)), " +
	           "LOWER(TRIM(r.id.subRegion)), " +
	           "LOWER(TRIM(r.id.branchCode)), " +
	           "r.branch, " +
	           "r.companyCode, " +
	           "r.createDate) " +
	           "FROM RegionMasterDto r " +
	           "WHERE r.createDate BETWEEN :from AND :to " +
	           "AND (:region IS NULL OR LOWER(TRIM(r.id.region)) = LOWER(TRIM(:region))) " +
	           "AND (:subRegion IS NULL OR LOWER(TRIM(r.id.subRegion)) = LOWER(TRIM(:subRegion))) " +
	           "AND (:branch IS NULL OR LOWER(TRIM(r.id.branchCode)) = LOWER(TRIM(:branch)))")
	    List<RegionSearchDTO> searchRegions(
	            @Param("from") LocalDateTime from,
	            @Param("to") LocalDateTime to,
	            @Param("region") String region,
	            @Param("subRegion") String subRegion,
	            @Param("branch") String branch
	    );





}
