package com.logic.logistic.dto;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class RegionMasterId implements Serializable {

    @Column(name = "state")
    private String region;

    @Column(name = "city")
    private String subRegion;

    @Column(name = "branch_code")
	private String branchCode;


    public RegionMasterId() {}

    public RegionMasterId(String region, String subRegion, String branch) {
        this.region = region;
        this.subRegion = subRegion;
        this.branchCode = branch;
    }

  
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegionMasterId)) return false;
        RegionMasterId that = (RegionMasterId) o;
        return Objects.equals(region, that.region) &&
               Objects.equals(subRegion, that.subRegion) &&
               Objects.equals(branchCode, that.branchCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(region, subRegion, branchCode);
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

	public String getBranchCode() {
		return branchCode;
	}

	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}

	

   
}
