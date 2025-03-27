package com.logic.logistic.dto;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "branch_data")
public class BranchDTO {

	@Id
	@Column(name = "branchCode")
	private String branchCode;

	private String branchName;
	private String branchOpperations;
	@ManyToOne
	@JoinColumn(name = "company_Code", referencedColumnName = "company_Code")
	private CompanyDto company; // Each branch belongs to one company

	private Date createdate;

	private Date updatedate;

	@OneToOne
	@JoinColumn(name = "addressId", referencedColumnName = "addressId")
	private AddressDto addresse; // One branch can have one addresses

	public CompanyDto getCompany() {
		return company;
	}

	public void setCompany(CompanyDto company) {
		this.company = company;
	}

	public String getBranchName() {
		return branchName;
	}

	public void setBranchName(String branchName) {
		this.branchName = branchName;
	}

	public AddressDto getAddresse() {
		return addresse;
	}

	public void setAddresse(AddressDto addresse) {
		this.addresse = addresse;
	}

	public String getBranchCode() {
		return branchCode;
	}

	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}

	public String getBranchOpperations() {
		return branchOpperations;
	}

	public void setBranchOpperations(String branchOpperations) {
		this.branchOpperations = branchOpperations;
	}

	public Date getCreatedate() {
		return createdate;
	}

	public void setCreatedate(Date createdate) {
		this.createdate = createdate;
	}

	public Date getUpdatedate() {
		return updatedate;
	}

	public void setUpdatedate(Date updatedate) {
		this.updatedate = updatedate;
	}

	// Getters and Setters

}
