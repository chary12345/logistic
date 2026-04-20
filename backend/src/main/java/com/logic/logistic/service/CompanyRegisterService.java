package com.logic.logistic.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.logic.logistic.model.Branch;
import com.logic.logistic.model.BranchMap;
import com.logic.logistic.model.CompanyAndUserDetailsPojo;

public interface CompanyRegisterService {

	String isCompanyCodeExists(String companyCode);

	String isBranchCodeExist(String branchCode);

	String craeteBranch(Branch branchData);

	List<BranchMap> getBranchesByCompanyCode(String companyCode);

	List<CompanyAndUserDetailsPojo> getCompanyWithSuperAdminsList();

	ResponseEntity<byte[]> findByCompanyDetails_CompanyCode(String companyCode);

	String getNextLrNumber(String branchCode);

	Branch getBranchByCode(String branchCode);

	Branch updateBranch(String branchCode, Branch updatedBranch);

}
