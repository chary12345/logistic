package com.logic.logistic.model;

public class LoadRecieptPojo {

	private String companyCode;
	private String BranchCode;
    private int lastNumber;
	public String getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	public String getBranchCode() {
		return BranchCode;
	}
	public void setBranchCode(String branchCode) {
		BranchCode = branchCode;
	}
	public int getLastNumber() {
		return lastNumber;
	}
	public void setLastNumber(int lastNumber) {
		this.lastNumber = lastNumber;
	}
    
}
