package com.logic.logistic.model;

import java.time.LocalDateTime;

public class TbbSummaryRequest {

    private String consignorName;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    public TbbSummaryRequest() {
    }

    public TbbSummaryRequest(String consignorName, LocalDateTime fromDate, LocalDateTime toDate) {
        this.consignorName = consignorName;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

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
}
