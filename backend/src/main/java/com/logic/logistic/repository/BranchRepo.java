package com.logic.logistic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.model.BranchMap;

@Repository
public interface BranchRepo extends JpaRepository<BranchDTO, String>{
	@Query(value = "select * from logistics_logic.branch_data where branch_code= :branchCode",nativeQuery = true)
	BranchDTO getBranchBybranchCode(String branchCode);
	@Query(value = "select branch_Code as branchCode,branch_Name as branchName,branch_Type as branchType  from logistics_logic.branch_data where company_code= :companyCode",nativeQuery = true)
	List<BranchMap> getbranchesListByCompanyCode(String companyCode);

}
