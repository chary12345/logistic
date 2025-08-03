package com.logic.logistic.dto;

import java.time.LocalDateTime;

public class BookingSearchRequest {
	
	private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String status;
    private String lastId;
    private String branchCode;
    private String city;
    private String state;
    
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
	
	public BookingSearchRequest(LocalDateTime fromDate, LocalDateTime toDate, String status, String lastId,
			String branchCode, String city, String state) {
		super();
		this.fromDate = fromDate;
		this.toDate = toDate;
		this.status = status;
		this.lastId = lastId;
		this.branchCode = branchCode;
		this.city = city;
		this.state = state;
	}
	public BookingSearchRequest() {
		super();
	}
    

}
