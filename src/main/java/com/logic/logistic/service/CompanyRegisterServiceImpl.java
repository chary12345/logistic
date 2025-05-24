package com.logic.logistic.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.AddressDto;
import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.dto.CompanyDto;
import com.logic.logistic.mapper.BranchAndAddressMapper;
import com.logic.logistic.model.Branch;
import com.logic.logistic.model.BranchMap;
import com.logic.logistic.model.CompanyAndUserDetailsPojo;
import com.logic.logistic.repository.AddressRepo;
import com.logic.logistic.repository.BranchRepo;
import com.logic.logistic.repository.CompanyRegisterrepo;


@Service
public class CompanyRegisterServiceImpl implements CompanyRegisterService {



	@Autowired
	CompanyRegisterrepo companyRegisterrepo;

	@Autowired
	private BranchRepo branchRepo;

	@Autowired
	private AddressRepo addressRepo;

	

	@Override
	public String isCompanyCodeExists(String companyCode) {
		String status = "FAILURE";
		try {
			CompanyDto byId = companyRegisterrepo.getCompanyByID(companyCode);
			if (byId == null) {
				status = "SUCCESS";

			}
		} catch (Exception e) {
			status = e.getMessage();
		}
		return status;
	}

	@Override
	public String isBranchCodeExist(String branchCode) {
		String status = "FAILURE";
		try {
			BranchDTO branchBybranchCode = branchRepo.getBranchBybranchCode(branchCode);
			if (branchBybranchCode == null) {
				status = "SUCCESS";

			}
		} catch (Exception e) {
			status = e.getMessage();
		}
		return status;
	}

	@Override
	public String craeteBranch(Branch branchData) {
		String status = "FAILURE";
		try {

			BranchDTO branchDto = BranchAndAddressMapper.branchtoBranchDto(branchData);

			if (null != branchDto) {

				branchRepo.save(branchDto);
				System.out.println("branch created successfully");

				if (branchDto.getBranchCode() != null && branchData.getBranchAddress() != null) {
					AddressDto addressDto = BranchAndAddressMapper.addressToAddressDto(branchData.getBranchAddress(),
							branchDto.getBranchCode());

					addressRepo.save(addressDto);
					System.out.println("address created successfully");
					status = "SUCCESS";
				}
			}

		} catch (

		Exception e) {
			status = e.getMessage();
		}

		return status;
	}

	@Override
	public List<BranchMap> getBranchesByCompanyCode(String companyCode) {
		List<BranchMap> branchList=null;
		try {
		 branchList=branchRepo.getbranchesListByCompanyCode(companyCode);
		}catch (Exception e) {
			
		}
		return branchList;
	}

	@Override
	public List<CompanyAndUserDetailsPojo> getCompanyWithSuperAdminsList() {
		List<CompanyAndUserDetailsPojo> list = companyRegisterrepo.getCompanyiesAndSuperAdminList();
		return list;
	}

	

}
