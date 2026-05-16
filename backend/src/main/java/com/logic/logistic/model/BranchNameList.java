package com.logic.logistic.model;

public class BranchNameList {
	private String branchCode;
    private String branchName;
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
	public BranchNameList(String branchCode, String branchName) {
		super();
		this.branchCode = branchCode;
		this.branchName = branchName;
	}
    
    
}
