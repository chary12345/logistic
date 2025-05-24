package com.logic.logistic.model;

import java.sql.Date;

public class LoginResponse {

	private String firstName;
	private String lastName;
	private String userName;
    private String phone;
	private String email;
	private String role;
	private Date createdDate;
	private Date updatedDate;
	private Date expiryDate;
	private String logo;
	private String permissions;
	private String blockReason;
	private boolean blockUser;
	private String blockedBy;
	private CompanyAndBranch companyAndBranchDeatils;
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public Date getCreatedDate() {
		return createdDate;
	}
	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}
	public Date getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}
	public String getLogo() {
		return logo;
	}
	public void setLogo(String logo) {
		this.logo = logo;
	}
	public String getPermissions() {
		return permissions;
	}
	public void setPermissions(String permissions) {
		this.permissions = permissions;
	}
	public String getBlockReason() {
		return blockReason;
	}
	public void setBlockReason(String blockReason) {
		this.blockReason = blockReason;
	}
	public boolean isBlockUser() {
		return blockUser;
	}
	public void setBlockUser(boolean blockUser) {
		this.blockUser = blockUser;
	}
	public String getBlockedBy() {
		return blockedBy;
	}
	public void setBlockedBy(String blockedBy) {
		this.blockedBy = blockedBy;
	}
	public CompanyAndBranch getCompanyAndBranchDeatils() {
		return companyAndBranchDeatils;
	}
	public void setCompanyAndBranchDeatils(CompanyAndBranch companyAndBranchDeatils) {
		this.companyAndBranchDeatils = companyAndBranchDeatils;
	}
	
}
