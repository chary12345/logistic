package com.logic.logistic.dto;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "branch_data")
public class BranchDTO {

	@Id
	@Column(name = "branchCode")
	private String branchCode;
	private String branchName;
	private String branchType;
	private String branchOpperations;
	private String branchPhone;
	private String branchPhoneAlt;
	private String branchEmail;
	private String branchPan;
	private String gstIn;
	private String contactPersonName;
	private String companyCode;
	private String branchCreatedBy;
	private Date createDate;
	private Date updateDate;
	private boolean isBranchActive;
	public String getBranchCode() {
		return branchCode;
	}
	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}
	public String getBranchName() {
		return branchName;
	}
	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}
	public String getBranchType() {
		return branchType;
	}
	public void setBranchType(String branchType) {
		this.branchType = branchType;
	}
	public String getBranchOpperations() {
		return branchOpperations;
	}
	public void setBranchOpperations(String branchOpperations) {
		this.branchOpperations = branchOpperations;
	}
	public String getBranchPhone() {
		return branchPhone;
	}
	public void setBranchPhone(String branchPhone) {
		this.branchPhone = branchPhone;
	}
	public String getBranchEmail() {
		return branchEmail;
	}
	public void setBranchEmail(String branchEmail) {
		this.branchEmail = branchEmail;
	}
	public String getBranchPan() {
		return branchPan;
	}
	public void setBranchPan(String branchPan) {
		this.branchPan = branchPan;
	}
	public String getGstIn() {
		return gstIn;
	}
	public void setGstIn(String gstIn) {
		this.gstIn = gstIn;
	}
	public String getContactPersonName() {
		return contactPersonName;
	}
	public void setContactPersonName(String contactPersonName) {
		this.contactPersonName = contactPersonName;
	}
	public String getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	public String getBranchCreatedBy() {
		return branchCreatedBy;
	}
	public void setBranchCreatedBy(String branchCreatedBy) {
		this.branchCreatedBy = branchCreatedBy;
	}
	public Date getCreateDate() {
		return createDate;
	}
	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}
	public Date getUpdateDate() {
		return updateDate;
	}
	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}
	public boolean isBranchActive() {
		return isBranchActive;
	}
	public void setBranchActive(boolean isBranchActive) {
		this.isBranchActive = isBranchActive;
	}
	public String getBranchPhoneAlt() {
		return branchPhoneAlt;
	}
	public void setBranchPhoneAlt(String branchPhoneAlt) {
		this.branchPhoneAlt = branchPhoneAlt;
	}
	
}
