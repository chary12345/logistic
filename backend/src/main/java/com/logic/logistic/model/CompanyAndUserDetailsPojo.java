package com.logic.logistic.model;

import java.sql.Date;

public class CompanyAndUserDetailsPojo {

	private String companyCode;
	private String companyName;
	private String groupName;
	private String plan;
	private String userName;
	private String firstName;
	private String lastName;
	private String phone;
	private boolean companyBlocked;
	private Date expiryDate;
	public String getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	public String getCompanyName() {
		return companyName;
	}
	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	public String getPlan() {
		return plan;
	}
	public void setPlan(String plan) {
		this.plan = plan;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
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
	
	public boolean getCompanyBlocked() {
		return companyBlocked;
	}
	public void setCompanyBlocked(boolean companyBlocked) {
		this.companyBlocked = companyBlocked;
	}
	public Date getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}
	public CompanyAndUserDetailsPojo(String companyCode, String companyName, String groupName, String plan,
			String userName, String firstName, String lastName, String phone, boolean companyBlocked, Date expiryDate) {
		super();
		this.companyCode = companyCode;
		this.companyName = companyName;
		this.groupName = groupName;
		this.plan = plan;
		this.userName = userName;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.companyBlocked = companyBlocked;
		this.expiryDate = expiryDate;
	}
	
	
	
}
