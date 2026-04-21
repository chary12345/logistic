package com.logic.logistic.model;
import java.time.LocalDateTime;

public class TbbSummaryRequest {

    private String consignorName;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    // Optional future fields (you can use later)
    private String branchCode;
    private Boolean includeGst;

    // Getters & Setters

    public String getConsignorName() {
        return consignorName;
    }

    public void setConsignorName(String consignorName) {
        this.consignorName = consignorName;
    }

    public LocalDateTime getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDateTime fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDateTime getToDate() {
        return toDate;
    }

    public void setToDate(LocalDateTime toDate) {
        this.toDate = toDate;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public Boolean getIncludeGst() {
        return includeGst;
    }

    public void setIncludeGst(Boolean includeGst) {
        this.includeGst = includeGst;
    }
}