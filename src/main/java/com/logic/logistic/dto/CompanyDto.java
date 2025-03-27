package com.logic.logistic.dto;

import java.sql.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "company_dto")
public class CompanyDto {
	@Id
	@Column(name = "company_Code")
	private String companyCode;
	private String companyFullName;
	private String groupName;
	private String plan;
	private String logo;
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<BranchDTO> branches; // One company has many branches

    @OneToOne(mappedBy = "company")
    private UserDto user; // One company is owned by one user
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

	public String getLogo() {
		return logo;
	}

	public void setLogo(String logo) {
		this.logo = logo;
	}

	public List<BranchDTO> getBranches() {
		return branches;
	}

	public void setBranches(List<BranchDTO> branches) {
		this.branches = branches;
	}

	public UserDto getUser() {
		return user;
	}

	public void setUser(UserDto user) {
		this.user = user;
	}

	public String getPlan() {
		return plan;
	}

	public void setPlan(String plan) {
		this.plan = plan;
	}

	

}
