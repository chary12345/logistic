package com.logic.logistic.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;

@Entity
@IdClass(BranchId.class)
public class BranchMaster {

	@Id
	@Column(name = "state")
	private String region;
	@Id
	@Column(name = "city")
	private String subRegion;
	@Id
	@Column(name = "branch_area")
	private String branch;
	
	@Column(name = "branch_code")
	private String branchCode;

	@Column(name = "company_code")
	private String companyCode;
	
	@Column(name = "create_date")
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

	public String getBranch() {
		return branch;
	}

	public void setBranch(String branch) {
		this.branch = branch;
	}

	
	public String getBranchCode() {
		return branchCode;
	}

	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
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

	public BranchMaster(String region, String subRegion, String branch, String branchCode, String companyCode,
			LocalDateTime createDate) {
		super();
		this.region = region;
		this.subRegion = subRegion;
		this.branch = branch;
		this.branchCode = branchCode;
		this.companyCode = companyCode;
		this.createDate = createDate;
	}

	
//	@Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//	@Column(name = "region", length = 100)
//    private String region;
//	
//	@Column(name = "subRegion", length = 100)
//    private String subRegion;
//	
//	@Column(name = "branch", length = 100)
//    private String branch;

}