package com.logic.logistic.model;

import java.util.List;

public class TbbStatementResponse {

    private String consignorName;
    private int totalLrs;
    private double totalFreight;
    private double totalGst;
    private double totalAmount;
    private List<LrStatementDTO> lrStatements;

    public String getConsignorName() {
        return consignorName;
    }

    public void setConsignorName(String consignorName) {
        this.consignorName = consignorName;
    }

    public int getTotalLrs() {
        return totalLrs;
    }

    public void setTotalLrs(int totalLrs) {
        this.totalLrs = totalLrs;
    }

    public double getTotalFreight() {
        return totalFreight;
    }

    public void setTotalFreight(double totalFreight) {
        this.totalFreight = totalFreight;
    }

    public double getTotalGst() {
        return totalGst;
    }

    public void setTotalGst(double totalGst) {
        this.totalGst = totalGst;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<LrStatementDTO> getLrStatements() {
        return lrStatements;
    }

    public void setLrStatements(List<LrStatementDTO> lrStatements) {
        this.lrStatements = lrStatements;
    }
}