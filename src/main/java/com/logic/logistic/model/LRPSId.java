package com.logic.logistic.model;

import java.io.Serializable;
import java.util.Objects;

public class LRPSId implements Serializable {
	
	private String region, subRegion, branch, lrNumber;

    // Constructors, equals, hashCode
    public LRPSId() {}
    public LRPSId(String region, String subRegion, String branch, String lrNumber) {
        this.region = region; this.subRegion = subRegion; this.branch = branch; this.lrNumber = lrNumber;
    }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LRPSId)) return false;
        LRPSId that = (LRPSId) o;
        return Objects.equals(region, that.region) &&
               Objects.equals(subRegion, that.subRegion) &&
               Objects.equals(branch, that.branch) &&
               Objects.equals(lrNumber, that.lrNumber);
    }
    public int hashCode() { 
    	return Objects.hash(region, subRegion, branch, lrNumber); 
    	}


}
