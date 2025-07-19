package com.logic.logistic.service;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.logic.logistic.dto.AddressDto;
import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.dto.CompanyDto;
import com.logic.logistic.dto.RegionMasterDto;
import com.logic.logistic.dto.RegionMasterId;
import com.logic.logistic.mapper.BranchAndAddressMapper;
import com.logic.logistic.model.Address;
import com.logic.logistic.model.Branch;
import com.logic.logistic.model.BranchMap;
import com.logic.logistic.model.CompanyAndUserDetailsPojo;
import com.logic.logistic.repository.AddressRepo;
import com.logic.logistic.repository.BranchRepo;
import com.logic.logistic.repository.CompanyRegisterrepo;
import com.logic.logistic.repository.RegionMasterRepository;

@Service
public class CompanyRegisterServiceImpl implements CompanyRegisterService {

	private static final long serialVersionUID = 1L;

	private static org.apache.logging.log4j.Logger logger = LogManager.getLogger();

	@Autowired
	CompanyRegisterrepo companyRegisterrepo;

	@Autowired
	private BranchRepo branchRepo;

	@Autowired
	private AddressRepo addressRepo;

	@Autowired
	private RegionMasterRepository regionMasterRepo;

	@Override
	public String isCompanyCodeExists(String companyCode) {
		String status = "FAILURE";
		try {
			CompanyDto byId = companyRegisterrepo.getCompanyByID(companyCode);
			if (byId == null) {
				status = "SUCCESS";
				logger.info("SUCCESS: " + byId);

			}
		} catch (Exception e) {
			status = e.getMessage();
			logger.error("Exception in companycode : " + e);
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
				logger.info("SUCCESS: " + branchBybranchCode);

			}
		} catch (Exception e) {
			status = e.getMessage();
			logger.error("Exception in branchcode : " + e);
		}
		return status;
	}

	@Override
	public String craeteBranch(Branch branchData) {
		String status = "FAILURE";
		try {

			BranchDTO branchDto = BranchAndAddressMapper.branchtoBranchDto(branchData);

			if (null != branchDto) {
				boolean saveRegion = saveRegion(branchData);
				if (saveRegion) {
					branchRepo.save(branchDto);
					System.out.println("branch created successfully");
					logger.info("branch created successfully");

					if (branchDto.getBranchCode() != null && branchData.getBranchAddress() != null) {
						AddressDto addressDto = BranchAndAddressMapper
								.addressToAddressDto(branchData.getBranchAddress(), branchDto.getBranchCode());

						addressRepo.save(addressDto);
						System.out.println("address created successfully");
						logger.info("address created successfully");
						status = "SUCCESS";
					}
				}
			}else {
				logger.error("unable to save regions" );
				status = "Unable to create Regions";
			}
		} catch (

		Exception e) {
			status = e.getMessage();
			logger.error("Exception in branchdata" + e);
		}

		return status;
	}

	private boolean saveRegion(Branch branchData) {
		boolean savedRegion = false;
		try {
			Address branchAddress = branchData.getBranchAddress();
			RegionMasterDto regions = new RegionMasterDto();
			RegionMasterId idMaster = new RegionMasterId();
			idMaster.setRegion(branchAddress.getState());
			idMaster.setSubRegion(branchAddress.getCity());
			idMaster.setBranchCode(branchData.getBranchCode());
			regions.setId(idMaster);
			regions.setBranch(branchData.getBranchName());
			regions.setCompanyCode(branchData.getCompanyCode());
			regions.setCreateDate(LocalDateTime.now());
			regionMasterRepo.save(regions);
			savedRegion = true;
			logger.info("regions store successfully " + regions);
		} catch (Exception e) {
			logger.error("Exception in branchdata" + e);
		}
		return savedRegion;

	}

	@Override
	public List<BranchMap> getBranchesByCompanyCode(String companyCode) {
		List<BranchMap> branchList = null;
		try {
			branchList = branchRepo.getbranchesListByCompanyCode(companyCode);
			logger.info("getBranchesByCompanyCode : " + branchList);
		} catch (Exception e) {
			logger.error("Exception in getBranchesByCompanyCode : " + e);
		}
		return branchList;
	}

	@Override
	public List<CompanyAndUserDetailsPojo> getCompanyWithSuperAdminsList() {
		List<CompanyAndUserDetailsPojo> list = companyRegisterrepo.getCompanyiesAndSuperAdminList();
		return list;
	}

	@Override
	public ResponseEntity<byte[]> findByCompanyDetails_CompanyCode(String companyCode) {
		CompanyDto companyData = companyRegisterrepo.findById(companyCode).orElseThrow();

		byte[] logo = companyData.getLogo();

		if (logo == null || logo.length == 0) {
			// return 404 so frontend can fallback to text
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
		return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(logo);
	}

}
