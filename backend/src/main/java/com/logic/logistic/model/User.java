package com.logic.logistic.model;

import java.sql.Date;




public class User {
	private String firstName;
	private String lastName;
	private String userName;
	private String password;
    private String phone;
	private String email;
	private String role;
	private Date createdDate;
	private Date updatedDate;
	private Date expiryDate;
	private Company companyDetails;
	private String logo;
	private String permissions;
	private String blockReason;
	private boolean blockUser;
	private String blockedBy;
	
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
	public Date getCreatedDate() {
		return createdDate;
	}
	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}
	
	public Company getCompanyDetails() {
		return companyDetails;
	}
	public void setCompanyDetails(Company companyDetails) {
		this.companyDetails = companyDetails;
	}
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
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
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
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public Date getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}
	
	
	
}
