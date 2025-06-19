package com.logic.logistic.model;

import java.sql.Date;



public class Company {
private String fullName;
private String companyCode;
private String group;
private Plan plan;
private Date createdate;
private Date updateDate;
private Date expiryDate;
private Date startDate;
private Branch companyBranch;
private String logo;
public String getFullName() {
	return fullName;
}
public void setFullName(String fullName) {
	this.fullName = fullName;
}

public String getCompanyCode() {
	return companyCode;
}
public Plan getPlan() {
	return plan;
}
public void setPlan(Plan plan) {
	this.plan = plan;
}
public void setCompanyCode(String companyCode) {
	this.companyCode = companyCode;
}



public Branch getCompanyBranch() {
	return companyBranch;
}
public void setCompanyBranch(Branch companyBranch) {
	this.companyBranch = companyBranch;
}
public String getGroup() {
	return group;
}
public void setGroup(String group) {
	this.group = group;
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


}
