package com.logic.logistic.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class SearchReports {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	private String region;
	private String subRegion;
	private String branchhName;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
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
	public String getBranchhName() {
		return branchhName;
	}
	public void setBranchhName(String branchhName) {
		this.branchhName = branchhName;
	}
	
	

}
