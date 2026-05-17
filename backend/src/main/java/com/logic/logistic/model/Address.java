package com.logic.logistic.model;

import java.sql.Date;

public class Address {
	private String flatOrApartmentNumber;
	private String areaOrStreetline;
	private String landMark;
	private String city;
	private String state;
	private String postalCode;
	private String country = "india";
	private Date createDate;
	private Date updatedDate;

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

}
