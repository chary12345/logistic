package com.logic.logistic.model;

public class BranchMap {
	private String branchCode;
	private String branchName;
	private String branchType;
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
	public boolean isBranchActive() {
		return isBranchActive;
	}
	public void setBranchActive(boolean isBranchActive) {
		this.isBranchActive = isBranchActive;
	}
	public BranchMap(String branchCode, String branchName, String branchType) {
		super();
		this.branchCode = branchCode;
		this.branchName = branchName;
		this.branchType = branchType;
	}
	public BranchMap(String branchCode, String branchName, String branchType, boolean isBranchActive) {
		super();
		this.branchCode = branchCode;
		this.branchName = branchName;
		this.branchType = branchType;
		this.isBranchActive = isBranchActive;
	}
	public BranchMap() {
		super();
	}
}
