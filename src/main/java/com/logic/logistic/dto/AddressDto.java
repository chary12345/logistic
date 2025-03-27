package com.logic.logistic.dto;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "address_dto")
public class AddressDto {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "addressId")
    private Long addressId;

    private String flatOrApartmentNumber;
    private String areaOrStreetline;
    private String landMark;
    private String postalCode;
    private String state;
    private String city;
    private String country;
    private Date createDate;
    private Date updatedDate;

	/*
	 * @OneToOne(mappedBy = "addresse") private BranchDTO branch; // One branch can
	 * have many addresses
	 */   
   // private CompanyDto comapany;
	public Long getAddressId() {
		return addressId;
	}
	public void setAddressId(Long addressId) {
		this.addressId = addressId;
	}
	public String getFlatOrApartmentNumber() {
		return flatOrApartmentNumber;
	}
	public void setFlatOrApartmentNumber(String flatOrApartmentNumber) {
		this.flatOrApartmentNumber = flatOrApartmentNumber;
	}
	public String getAreaOrStreetline() {
		return areaOrStreetline;
	}
	public void setAreaOrStreetline(String areaOrStreetline) {
		this.areaOrStreetline = areaOrStreetline;
	}
	public String getLandMark() {
		return landMark;
	}
	public void setLandMark(String landMark) {
		this.landMark = landMark;
	}
	public String getPostalCode() {
		return postalCode;
	}
	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public Date getCreateDate() {
		return createDate;
	}
	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}
	/*
	 * public BranchDTO getBranch() { return branch; } public void
	 * setBranch(BranchDTO branch) { this.branch = branch; }
	 */
	
	
	
}
