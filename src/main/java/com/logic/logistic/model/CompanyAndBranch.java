package com.logic.logistic.model;

public class CompanyAndBranch {
	private String companyCode;
	private String companyName;
	private String groupName;
	private String plan;
	private String companyLogo;
	
	
	private String branchCode;
	private String branchName;
	private String branchType;
	
	private boolean isCompanyActive;
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
	public String getCompanyLogo() {
		return companyLogo;
	}
	public void setCompanyLogo(String companyLogo) {
		this.companyLogo = companyLogo;
	}
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
	
	public boolean isCompanyActive() {
		return isCompanyActive;
	}
	public void setCompanyActive(boolean isCompanyActive) {
		this.isCompanyActive = isCompanyActive;
	}
	
	public CompanyAndBranch(String companyCode, String companyName, String groupName, String plan, String companyLogo,
			String branchCode, String branchName, String branchType, boolean isCompanyActive) {
		super();
		this.companyCode = companyCode;
		this.companyName = companyName;
		this.groupName = groupName;
		this.plan = plan;
		this.companyLogo = companyLogo;
		this.branchCode = branchCode;
		this.branchName = branchName;
		this.branchType = branchType;
		this.isCompanyActive = isCompanyActive;
	}
	public CompanyAndBranch() {
		
		
	}
	
	
	
}
