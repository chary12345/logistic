package com.logic.logistic.dto;

import java.time.LocalDateTime;

public class BookingSearchRequest {
    private String state;
    private String city;
    private String branchCode;
	private String companyCode;
    private String status=null;
    private String lastId;
    private int page;

    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    
	public LocalDateTime getFromDate() {
		return fromDate;
	}
	public void setFromDate(LocalDateTime fromDate) {
		this.fromDate = fromDate;
	}
	public LocalDateTime getToDate() {
		return toDate;
	}
	public void setToDate(LocalDateTime toDate) {
		this.toDate = toDate;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getLastId() {
		return lastId;
	}
	public void setLastId(String lastId) {
		this.lastId = lastId;
	}
	public String getBranchCode() {
		return branchCode;
	}
	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	
	public int getPage() {
		return page;
	}
	public void setPage(int page) {
		this.page = page;
	}

	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	public BookingSearchRequest(String state, String city, String branchCode, String companyCode, String status, String lastId, int page, LocalDateTime fromDate, LocalDateTime toDate) {
		this.state = state;
		this.city = city;
		this.branchCode = branchCode;
		this.companyCode = companyCode;
		this.status = status;
		this.lastId = lastId;
		this.page = page;
		this.fromDate = fromDate;
		this.toDate = toDate;
	}

	public BookingSearchRequest() {
		super();
	}
    

}
