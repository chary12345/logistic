package com.logic.logistic.mapper;

import java.sql.Date;

import com.logic.logistic.dto.AddressDto;
import com.logic.logistic.dto.BranchDTO;
import com.logic.logistic.model.Address;
import com.logic.logistic.model.Branch;



public class BranchAndAddressMapper {


	public static BranchDTO branchtoBranchDto(Branch branch) {
		boolean isActive=false;
		if (branch == null) {
			return null;
		}

		BranchDTO dto = new BranchDTO();

		if (branch.getBranchCode() != null) {
			dto.setBranchCode(branch.getBranchCode());
			isActive=true;
		}

		if (branch.getBranchName() != null) {
			dto.setBranchName(branch.getBranchName());
			isActive=true;
		}

		if (branch.getBranchType() != null) {
			dto.setBranchType(branch.getBranchType());
			isActive=true;
		}

		if (branch.getBranchOpperations() != null) {
			dto.setBranchOpperations(branch.getBranchOpperations());
			isActive=true;
		}

		if (branch.getBranchPhone() != null) {
			dto.setBranchPhone(branch.getBranchPhone());
			isActive=true;
		}
		
		if (branch.getBranchPhoneAlt() != null) {
			dto.setBranchPhoneAlt(branch.getBranchPhoneAlt());
			isActive=true;
		}

		if (branch.getBranchEmail() != null) {
			dto.setBranchEmail(branch.getBranchEmail());
			isActive=true;
		}

		if (branch.getBranchPan() != null) {
			dto.setBranchPan(branch.getBranchPan());
			isActive=true;
		}

		if (branch.getGstIn() != null) {
			dto.setGstIn(branch.getGstIn());
		}

		if (branch.getContactPersonName() != null) {
			dto.setContactPersonName(branch.getContactPersonName());
		}

		if (branch.getCompanyCode() != null) {
			dto.setCompanyCode(branch.getCompanyCode());
		}

		if (branch.getBranchCreatedBy() != null) {
			dto.setBranchCreatedBy(branch.getBranchCreatedBy());
		}

		
		if (branch.getUpdateDate() != null) {
			dto.setUpdateDate(branch.getUpdateDate());
			isActive=true;
		}
		if(isActive==true) {
			dto.setBranchActive(true);
			dto.setCreateDate(new Date(System.currentTimeMillis()));
		}
			

		return dto;
	}
	 public static AddressDto addressToAddressDto(Address address, String branchCode) {
	        if (address == null) {
	            return null;
	        }

	        AddressDto dto = new AddressDto();

	        if (address.getFlatOrApartmentNumber() != null) {
	            dto.setFlatOrApartmentNumber(address.getFlatOrApartmentNumber());
	        }

	        if (address.getAreaOrStreetline() != null) {
	            dto.setAreaOrStreetline(address.getAreaOrStreetline());
	        }

	        if (address.getLandMark() != null) {
	            dto.setLandMark(address.getLandMark());
	        }

	        if (address.getPostalCode() != null) {
	            dto.setPostalCode(address.getPostalCode());
	        }

	        if (address.getState() != null) {
	            dto.setState(address.getState());
	        }

	        if (address.getCity() != null) {
	            dto.setCity(address.getCity());
	        }

	        // Use address value if not null, else fallback to default "india"
	        dto.setCountry(address.getCountry() != null ? address.getCountry() : "india");

	        if (address.getCreateDate() != null) {
	            dto.setCreateDate(new Date(System.currentTimeMillis()));
	        }

	        if (address.getUpdatedDate() != null) {
	            dto.setUpdatedDate(address.getUpdatedDate());
	        }

	        // Explicitly map branchCode passed as argument
	        dto.setBranchCode(branchCode);

	        return dto;
	    }

}
