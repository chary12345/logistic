package com.logic.logistic.model;

public class OperationFilter {
	private String fromDate;
	private String toDate;
	private String region;
	private String subregion;
	private String employeeName;
	private String status;
	public String getFromDate() {
		return fromDate;
	}
	public void setFromDate(String fromDate) {
		this.fromDate = fromDate;
	}
	public String getToDate() {
		return toDate;
	}
	public void setToDate(String toDate) {
		this.toDate = toDate;
	}
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
	public String getSubregion() {
		return subregion;
	}
	public void setSubregion(String subregion) {
		this.subregion = subregion;
	}
	@com.fasterxml.jackson.annotation.JsonProperty("fromBranchCode")
	private String fromBranchCode;

	@com.fasterxml.jackson.annotation.JsonProperty("ToBranchCode")
	private String ToBranchCode;

	public String getFromBranchCode() {
		return fromBranchCode;
	}
	public void setFromBranchCode(String fromBranchCode) {
		this.fromBranchCode = fromBranchCode;
	}

	public String getToBranchCode() {
		return ToBranchCode;
	}
	public void setToBranchCode(String toBranchCode) {
		this.ToBranchCode = toBranchCode;
	}
	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	
	
}
