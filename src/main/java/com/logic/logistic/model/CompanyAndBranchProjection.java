package com.logic.logistic.model;

public interface CompanyAndBranchProjection {
    String getCompanyCode();
    String getCompanyName();
    String getGroupName();
    String getPlan();
    byte[] getCompanyLogo();
    String getBranchCode();
    String getBranchName();
    String getBranchType();
    Boolean getIsCompanyActive();
}
