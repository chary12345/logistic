package com.logic.logistic.service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logic.logistic.dto.AddressDto;
import com.logic.logistic.dto.BookingReceiptSequence;
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
import com.logic.logistic.repository.BookingReceiptSequenceRepository;
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

	@Autowired
	private BookingReceiptSequenceRepository sequenceRepo;

	@Autowired
	private EmailService emailService;

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

						// ── Send branch welcome email (async, non-blocking) ─────────────────
						if (branchData.getBranchEmail() != null && !branchData.getBranchEmail().isBlank()) {
							Address addr = branchData.getBranchAddress();
							emailService.sendBranchWelcomeEmail(
									branchData.getBranchEmail(),
									branchData.getBranchCode(),
									branchData.getBranchName(),
									branchData.getBranchType(),
									branchData.getCompanyCode(),
									addr != null ? addr.getCountry() : null,
									addr != null ? addr.getState() : null,
									addr != null ? addr.getCity() : null,
									addr != null ? addr.getAreaOrStreetline() : null,
									addr != null ? addr.getPostalCode() : null,
									branchData.getBranchPhone(),
									branchData.getBranchPhoneAlt(),
									branchData.getGstIn(),
									branchData.getContactPersonName(),
									branchData.getBranchCreatedBy());
						}
						// ───────────────────────────────────────────────────────────────────
					}
				}
			} else {
				logger.error("unable to save regions");
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

	@Override
	public String getNextLrNumber(String branchCode) {
		try {
			if (branchCode == null || branchCode.trim().isEmpty()) {
				throw new IllegalArgumentException("Branch code is missing");
			}

			BookingReceiptSequence sequence = sequenceRepo.findById(branchCode).orElseGet(() -> {
				BookingReceiptSequence s = new BookingReceiptSequence();
				s.setKeyCode(branchCode);
				s.setLastNumber(0);
				return s;
			});

			int nextSerial = sequence.getLastNumber() + 1;
			return branchCode + "/" + String.format("%03d", nextSerial);
		} catch (Exception e) {
			// other errors
			System.out.println("Unexpected Error in getNextLrNumber: " + e.getMessage());
			return "";
		}
	}

	@SuppressWarnings("deprecation")
	@Override
	public Branch getBranchByCode(String branchCode) {
		Branch branchDetails = null;
		try {
			if (branchCode != null) {
				BranchDTO BranchObj = branchRepo.getById(branchCode);
				AddressDto addressObj = addressRepo.findByBranchCode(branchCode);
				branchDetails = BranchAndAddressMapper.DtostoBranchMap(BranchObj, addressObj);
			}
		} catch (Exception e) {
			System.out.println("exception occured at getbranchbycode :: " + e.getMessage());
		}
		return branchDetails;
	}

	@Override
	public Branch updateBranch(String branchCode, Branch updatedBranch) {
		BranchDTO existing = branchRepo.findById(branchCode)
				.orElseThrow(() -> new RuntimeException("Branch not found"));

		java.util.Map<String, String[]> changes = new java.util.LinkedHashMap<>();

		// Branch Fields tracking
		if (updatedBranch.getBranchName() != null && !java.util.Objects.equals(existing.getBranchName(), updatedBranch.getBranchName())) {
			changes.put("Branch Name", new String[]{existing.getBranchName(), updatedBranch.getBranchName()});
			existing.setBranchName(updatedBranch.getBranchName());
		}
		if (updatedBranch.getBranchType() != null && !java.util.Objects.equals(existing.getBranchType(), updatedBranch.getBranchType())) {
			changes.put("Branch Type", new String[]{existing.getBranchType(), updatedBranch.getBranchType()});
			existing.setBranchType(updatedBranch.getBranchType());
		}
		if (updatedBranch.getBranchPhone() != null && !java.util.Objects.equals(existing.getBranchPhone(), updatedBranch.getBranchPhone())) {
			changes.put("Primary Phone", new String[]{existing.getBranchPhone(), updatedBranch.getBranchPhone()});
			existing.setBranchPhone(updatedBranch.getBranchPhone());
		}
		if (updatedBranch.getBranchPhoneAlt() != null && !java.util.Objects.equals(existing.getBranchPhoneAlt(), updatedBranch.getBranchPhoneAlt())) {
			changes.put("Alternate Phone", new String[]{existing.getBranchPhoneAlt(), updatedBranch.getBranchPhoneAlt()});
			existing.setBranchPhoneAlt(updatedBranch.getBranchPhoneAlt());
		}
		if (updatedBranch.getBranchEmail() != null && !java.util.Objects.equals(existing.getBranchEmail(), updatedBranch.getBranchEmail())) {
			changes.put("Branch Email", new String[]{existing.getBranchEmail(), updatedBranch.getBranchEmail()});
			existing.setBranchEmail(updatedBranch.getBranchEmail());
		}
		if (updatedBranch.getGstIn() != null && !java.util.Objects.equals(existing.getGstIn(), updatedBranch.getGstIn())) {
			changes.put("GSTIN", new String[]{existing.getGstIn(), updatedBranch.getGstIn()});
			existing.setGstIn(updatedBranch.getGstIn());
		}
		if (updatedBranch.getContactPersonName() != null && !java.util.Objects.equals(existing.getContactPersonName(), updatedBranch.getContactPersonName())) {
			changes.put("Contact Person", new String[]{existing.getContactPersonName(), updatedBranch.getContactPersonName()});
			existing.setContactPersonName(updatedBranch.getContactPersonName());
		}
		// Sync active status explicitly
		if (existing.isBranchActive() != updatedBranch.isBranchActive()) {
			changes.put("Branch Status", new String[]{existing.isBranchActive() ? "ACTIVE" : "DEACTIVATED", updatedBranch.isBranchActive() ? "ACTIVE" : "DEACTIVATED"});
			existing.setBranchActive(updatedBranch.isBranchActive());
		}

		// ✅ set current SQL date
		existing.setUpdateDate(Date.valueOf(LocalDate.now()));

		// address update
		AddressDto address = addressRepo.findByBranchCode(branchCode);
		if (address != null && updatedBranch.getBranchAddress() != null) {
			Address updatedAddr = updatedBranch.getBranchAddress();

			if (updatedAddr.getAreaOrStreetline() != null && !java.util.Objects.equals(address.getAreaOrStreetline(), updatedAddr.getAreaOrStreetline())) {
				changes.put("Street Area", new String[]{address.getAreaOrStreetline(), updatedAddr.getAreaOrStreetline()});
				address.setAreaOrStreetline(updatedAddr.getAreaOrStreetline());
			}
			if (updatedAddr.getFlatOrApartmentNumber() != null && !java.util.Objects.equals(address.getFlatOrApartmentNumber(), updatedAddr.getFlatOrApartmentNumber())) {
				changes.put("Flat / Appt No", new String[]{address.getFlatOrApartmentNumber(), updatedAddr.getFlatOrApartmentNumber()});
				address.setFlatOrApartmentNumber(updatedAddr.getFlatOrApartmentNumber());
			}
			if (updatedAddr.getLandMark() != null && !java.util.Objects.equals(address.getLandMark(), updatedAddr.getLandMark())) {
				changes.put("Landmark", new String[]{address.getLandMark(), updatedAddr.getLandMark()});
				address.setLandMark(updatedAddr.getLandMark());
			}
			if (updatedAddr.getPostalCode() != null && !java.util.Objects.equals(address.getPostalCode(), updatedAddr.getPostalCode())) {
				changes.put("Postal Code", new String[]{address.getPostalCode(), updatedAddr.getPostalCode()});
				address.setPostalCode(updatedAddr.getPostalCode());
			}
			if (updatedAddr.getState() != null && !java.util.Objects.equals(address.getState(), updatedAddr.getState())) {
				changes.put("State", new String[]{address.getState(), updatedAddr.getState()});
				address.setState(updatedAddr.getState());
			}
			if (updatedAddr.getCity() != null && !java.util.Objects.equals(address.getCity(), updatedAddr.getCity())) {
				changes.put("City", new String[]{address.getCity(), updatedAddr.getCity()});
				address.setCity(updatedAddr.getCity());
			}
			if (updatedAddr.getCountry() != null && !java.util.Objects.equals(address.getCountry(), updatedAddr.getCountry())) {
				changes.put("Country", new String[]{address.getCountry(), updatedAddr.getCountry()});
				address.setCountry(updatedAddr.getCountry());
			}

			address.setUpdatedDate(Date.valueOf(LocalDate.now()));
			addressRepo.save(address);
		}

		branchRepo.save(existing);

		Branch result = BranchAndAddressMapper.DtostoBranchMap(existing, address);

		if (result.getBranchEmail() != null && !result.getBranchEmail().isBlank()) {
			Address addr = result.getBranchAddress();
			emailService.sendBranchUpdateEmail(
					result.getBranchEmail(),
					result.getBranchCode(),
					result.getBranchName(),
					result.getBranchType(),
					result.getCompanyCode(),
					addr != null ? addr.getCountry() : null,
					addr != null ? addr.getState() : null,
					addr != null ? addr.getCity() : null,
					addr != null ? addr.getAreaOrStreetline() : null,
					addr != null ? addr.getPostalCode() : null,
					result.getBranchPhone(),
					result.getBranchPhoneAlt(),
					result.getGstIn(),
					result.getContactPersonName(),
					result.isBranchActive(),
					changes);
		}

		return result;
	}

}
