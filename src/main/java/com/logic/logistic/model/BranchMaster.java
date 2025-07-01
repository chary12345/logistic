package com.logic.logistic.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;

@Entity
@IdClass(BranchId.class)

public class BranchMaster {
	
	@Id
	private String region;
	@Id
    private String subRegion;
	@Id
    private String branch;
	
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
	
	public BranchMaster(String region, String subRegion, String branch) {
		super();
		this.region = region;
		this.subRegion = subRegion;
		this.branch = branch;
	}
	
	
	

	
//	@Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//	@Column(name = "region", length = 100)
//    private String region;
//	
//	@Column(name = "subRegion", length = 100)
//    private String subRegion;
//	
//	@Column(name = "branch", length = 100)
//    private String branch;
	
	
}
