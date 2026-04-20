package com.logic.logistic.dto;


import java.io.Serializable;
import java.util.Objects;

public class BranchId implements Serializable {
	
	private String region;
    private String subRegion;
    private String branch;

    // Constructors, equals, hashCode
    public BranchId() {}
    public BranchId(String region, String subRegion, String branch) {
        this.region = region; this.subRegion = subRegion; this.branch = branch;
    }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BranchId)) return false;
        BranchId that = (BranchId) o;
        return Objects.equals(region, that.region) &&
               Objects.equals(subRegion, that.subRegion) &&
               Objects.equals(branch, that.branch);
    }
    public int hashCode() { return Objects.hash(region, subRegion, branch); }


}