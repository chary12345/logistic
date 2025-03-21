package com.logic.logistic.dto;

import java.sql.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "company_dto")
public class CompanyDto {
	@Id
	@Column(name = "companyCode")
	private String companyCode;
	private String companyFullName;
	@OneToMany(cascade = CascadeType.ALL)
	@JoinColumn(name = "companyCode", referencedColumnName = "companyCode") // Use the 'companyCode' from CompanyDto as
																			// the FK
	private List<AddressDto> address;
	private String groupName;
	private Date createdate;
	private Date updateDate;
	private Date expiryDate;
	private Date startDate;

	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	public String getCompanyFullName() {
		return companyFullName;
	}

	public void setCompanyFullName(String companyFullName) {
		this.companyFullName = companyFullName;
	}

	public List<AddressDto> getAddress() {
		return address;
	}

	public void setAddress(List<AddressDto> address) {
		this.address = address;
	}

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	

	public Date getCreatedate() {
		return createdate;
	}

	public void setCreatedate(Date createdate) {
		this.createdate = createdate;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

	public Date getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	

}
