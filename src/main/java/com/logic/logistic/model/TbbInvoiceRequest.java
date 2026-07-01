package com.logic.logistic.model;

import java.util.List;

public class TbbInvoiceRequest {
    private List<String> lrIds;
    private String consignorName;
    private String fromBranch;
    private Double totalAmount;

    public List<String> getLrIds() {
        return lrIds;
    }

    public void setLrIds(List<String> lrIds) {
        this.lrIds = lrIds;
    }

    public String getConsignorName() {
        return consignorName;
    }

    public void setConsignorName(String consignorName) {
        this.consignorName = consignorName;
    }

    public String getFromBranch() {
        return fromBranch;
    }

    public void setFromBranch(String fromBranch) {
        this.fromBranch = fromBranch;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
