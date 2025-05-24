package com.logic.logistic.model;

public class BranchMap {
	private String branchCode;
	private String branchName;
	private String branchType;
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
	public BranchMap(String branchCode, String branchName, String branchType) {
		super();
		this.branchCode = branchCode;
		this.branchName = branchName;
		this.branchType = branchType;
	}
	public BranchMap() {
		super();
	}
	
}
