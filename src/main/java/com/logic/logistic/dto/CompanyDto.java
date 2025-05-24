package com.logic.logistic.dto;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "company_dto")
public class CompanyDto {
	@Id
	private String companyCode;
	private String companyFullName;
	private String groupName;
	private String plan;
	private String logo;
	private Date createdate;
	private Date updateDate;
	private Date expiryDate;
	private Date startDate;
	private boolean isCompanyBlock;
	private String companyBlockedBy;
	@Column(name = "company_blocked_reason")
	private String companyBlockReason;

	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	public String getCompanyFullName() {
		return companyFullName;
	}

	public void setCompanyFullName(String companyFullName) {
		this.companyFullName = companyFullName;
	}

	

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	

	public Date getCreatedate() {
		return createdate;
	}

	public void setCreatedate(Date createdate) {
		this.createdate = createdate;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

	public Date getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public String getLogo() {
		return logo;
	}

	public void setLogo(String logo) {
		this.logo = logo;
	}

	
	public String getPlan() {
		return plan;
	}

	public void setPlan(String plan) {
		this.plan = plan;
	}

	public boolean isCompanyBlock() {
		return isCompanyBlock;
	}

	public void setCompanyBlock(boolean isCompanyBlock) {
		this.isCompanyBlock = isCompanyBlock;
	}

	public String getCompanyBlockedBy() {
		return companyBlockedBy;
	}

	public void setCompanyBlockedBy(String companyBlockedBy) {
		this.companyBlockedBy = companyBlockedBy;
	}

	public String getCompanyBlockReason() {
		return companyBlockReason;
	}

	public void setCompanyBlockReason(String companyBlockReason) {
		this.companyBlockReason = companyBlockReason;
	}

	

}
