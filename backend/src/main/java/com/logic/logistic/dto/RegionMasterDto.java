package com.logic.logistic.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "region_master")

public class RegionMasterDto {

    @EmbeddedId
    private RegionMasterId id;
	
	public RegionMasterId getId() {
		return id;
	}

	public void setId(RegionMasterId id) {
		this.id = id;
	}
    @Column(name = "branch_area")
    private String branch;
	
	@Column(name = "company_code")
	private String companyCode;
	
	@Column(name = "create_date")
	private LocalDateTime createDate;
	

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

}