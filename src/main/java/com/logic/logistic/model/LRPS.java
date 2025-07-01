package com.logic.logistic.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;

@Entity
@IdClass(LRPSId.class)
public class LRPS {

	@Id
	private String region;
	@Id
	private String subRegion;
	@Id
	private String branch;
	@Id
	private String lrNumber;

	private LocalDate paidDate;
	private BigDecimal amount;
	public String getRegion() {
		return region;
	}
	public void setRegion(String region) {
		this.region = region;
	}
	public String getSubRegion() {
		return subRegion;
	}
	public void setSubRegion(String subRegion) {
		this.subRegion = subRegion;
	}
	public String getBranch() {
		return branch;
	}
	public void setBranch(String branch) {
		this.branch = branch;
	}
	public String getLrNumber() {
		return lrNumber;
	}
	public void setLrNumber(String lrNumber) {
		this.lrNumber = lrNumber;
	}
	public LocalDate getPaidDate() {
		return paidDate;
	}
	public void setPaidDate(LocalDate paidDate) {
		this.paidDate = paidDate;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public LRPS(String region, String subRegion, String branch, String lrNumber, LocalDate paidDate,
			BigDecimal amount) {
		super();
		this.region = region;
		this.subRegion = subRegion;
		this.branch = branch;
		this.lrNumber = lrNumber;
		this.paidDate = paidDate;
		this.amount = amount;
	}
	
	

}
