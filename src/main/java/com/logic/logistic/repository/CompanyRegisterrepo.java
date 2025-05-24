package com.logic.logistic.repository;

import java.sql.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.logic.logistic.dto.CompanyDto;
import com.logic.logistic.model.CompanyAndBranch;
import com.logic.logistic.model.CompanyAndUserDetailsPojo;

import jakarta.transaction.Transactional;

@Repository
public interface CompanyRegisterrepo extends JpaRepository<CompanyDto, String> {

	@Query(value = "select * from logistics_logic.company_dto where company_code= :companyCode", nativeQuery = true)
	CompanyDto getCompanyByID(String companyCode);

	// Custom Query to JOIN company and branch data
	@Query(value = "SELECT c.company_code AS companyCode,c.company_full_name AS companyName,c.group_name AS groupName,c.plan AS plan,c.logo AS companyLogo, b.branch_code AS branchCode,b.branch_name AS branchName, b.branch_type AS branchType FROM logistics_logic.company_dto c JOIN logistics_logic.branch_data b  ON c.company_code = b.company_code WHERE c.company_code = :companyCode AND b.branch_code = :branchCode", nativeQuery = true)
	CompanyAndBranch fetchCompanyAndBranchdetgails(String companyCode, String branchCode);

	@Query(value = "SELECT  c.company_code AS companyCode,c.company_full_name AS companyName,c.group_name AS groupName,c.plan AS plan,u.user_name,u.first_name,u.last_name,u.phone,c.is_company_block as companyBlocked,c.expiry_date as expiryDate FROM  company_dto c JOIN  user_data u ON u.company_code = c.company_code WHERE  u.role = 'SuperAdmin'",nativeQuery = true)
	List<CompanyAndUserDetailsPojo> getCompanyiesAndSuperAdminList();

	@Transactional
	@Modifying
	@Query(value = "UPDATE logistics_logic.company_dto SET company_code = :companyCode, company_blocked_reason = :blockedReason, update_date = :updatedDate, company_blocked_by = :blockedBy, is_company_block = 1 WHERE company_code =  :companyCode",nativeQuery = true)
	void blockCompanyByCompanyCode(String companyCode, String blockedBy, String blockedReason, Date updatedDate);
	@Transactional
	@Modifying
	@Query(value = "UPDATE logistics_logic.company_dto SET company_code = :companyCode, update_date = :updatedDate, company_blocked_by = :blockedBy, is_company_block = 0, expiry_date= :expiryDate WHERE company_code =  :companyCode",nativeQuery = true)
	void reactivateCompany(String companyCode, String blockedBy, Date updatedDate, Date expiryDate);
	 

}
