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

    @Column(name = "branch_area")
    private String branch;

    public RegionMasterId() {}

    public RegionMasterId(String region, String subRegion, String branch) {
        this.region = region;
        this.subRegion = subRegion;
        this.branch = branch;
    }

  
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegionMasterId)) return false;
        RegionMasterId that = (RegionMasterId) o;
        return Objects.equals(region, that.region) &&
               Objects.equals(subRegion, that.subRegion) &&
               Objects.equals(branch, that.branch);
    }

    @Override
    public int hashCode() {
        return Objects.hash(region, subRegion, branch);
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

	public String getBranch() {
		return branch;
	}

	public void setBranch(String branch) {
		this.branch = branch;
	}

   
}
