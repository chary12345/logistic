package com.logic.logistic.model;

import java.util.List;

public class TbbStatementResponse {

    private String consignorName;
    private long totalLrs;
    private double totalFreight;
    private double totalGst;
    private double totalAmount;
    private List<LrStatementDTO> lrStatements;

    public TbbStatementResponse() {
    }

    public TbbStatementResponse(String consignorName, long totalLrs, double totalFreight, 
                                double totalGst, double totalAmount, List<LrStatementDTO> lrStatements) {
        this.consignorName = consignorName;
        this.totalLrs = totalLrs;
        this.totalFreight = totalFreight;
        this.totalGst = totalGst;
        this.totalAmount = totalAmount;
        this.lrStatements = lrStatements;
    }

    public String getConsignorName() {
        return consignorName;
    }

    public void setConsignorName(String consignorName) {
        this.consignorName = consignorName;
    }

    public long getTotalLrs() {
        return totalLrs;
    }

    public void setTotalLrs(long totalLrs) {
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
