package com.logic.logistic.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RegionSearchDTO {
	
	private String region;
    private String subRegion;
    private String branchCode;
    private String branch;
    private String companyCode;
    private LocalDateTime createDate;
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
	public String getSubRegion() {
		return subRegion;
	}
	public void setSubRegion(String subRegion) {
		this.subRegion = subRegion;
	}
	public String getBranchCode() {
		return branchCode;
	}
	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}
	public String getBranch() {
		return branch;
	}
	public void setBranch(String branch) {
		this.branch = branch;
	}
	public String getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	public LocalDateTime getCreateDate() {
		return createDate;
	}
	public void setCreateDate(LocalDateTime createDate) {
		this.createDate = createDate;
	}
	public RegionSearchDTO(String region, String subRegion, String branchCode, String branch, String companyCode,
			LocalDateTime createDate) {
		super();
		this.region = region;
		this.subRegion = subRegion;
		this.branchCode = branchCode;
		this.branch = branch;
		this.companyCode = companyCode;
		this.createDate = createDate;
	}
    
    
    
    

}
