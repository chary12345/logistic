package com.logic.logistic.dto;

import java.time.LocalDateTime;

// Statement DTO returned by /statement/report – exposes full charge breakdown per LR
public class StatementDto {

    // Identity
    private String        loadingReciept;
    private LocalDateTime bookingDate;
    private LocalDateTime dispatchDate;
    private String        consignorName;
    private String        consigneeName;
    private String        billType;
    private String        consignStatus;

    // Freight
    private double freight;

    // Individual charge fields (mirrors BookingChargeDetails table columns)
    private double lrCharge;
    private double hamali;
    private double loading;
    private double loadingCharge;
    private double stationary;
    private double otherChargesAmt;       // "Other Charges" charge type
    private double otherTransportCharges;
    private double miscellaneous;
    private double crossingAmount;
    private double podCharges;
    private double doorDelivery;
    private double doorPickup;
    private double ddc;
    private double dcc;
    private double demurrage;
    private double unloading;
    private double localVehicle;
    private double crossingHire;

    // GST (sgst + cgst + igst)
    private double sgst;
    private double cgst;
    private double igst;
    private double gst;

    // chargesTotal = sum of all non-freight, non-GST charges (the "Charges" column)
    private double chargesTotal;
    private double total;

    public StatementDto() {}

    // Getters & Setters

    public String getLoadingReciept() { return loadingReciept; }
    public void setLoadingReciept(String v) { this.loadingReciept = v; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime v) { this.bookingDate = v; }

    public LocalDateTime getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(LocalDateTime v) { this.dispatchDate = v; }

    public String getConsignorName() { return consignorName; }
    public void setConsignorName(String v) { this.consignorName = v; }

    public String getConsigneeName() { return consigneeName; }
    public void setConsigneeName(String v) { this.consigneeName = v; }

    public String getBillType() { return billType; }
    public void setBillType(String v) { this.billType = v; }

    public String getConsignStatus() { return consignStatus; }
    public void setConsignStatus(String v) { this.consignStatus = v; }

    public double getFreight() { return freight; }
    public void setFreight(double v) { this.freight = v; }

    public double getLrCharge() { return lrCharge; }
    public void setLrCharge(double v) { this.lrCharge = v; }

    public double getHamali() { return hamali; }
    public void setHamali(double v) { this.hamali = v; }

    public double getLoading() { return loading; }
    public void setLoading(double v) { this.loading = v; }

    public double getLoadingCharge() { return loadingCharge; }
    public void setLoadingCharge(double v) { this.loadingCharge = v; }

    public double getStationary() { return stationary; }
    public void setStationary(double v) { this.stationary = v; }

    public double getOtherChargesAmt() { return otherChargesAmt; }
    public void setOtherChargesAmt(double v) { this.otherChargesAmt = v; }

    public double getOtherTransportCharges() { return otherTransportCharges; }
    public void setOtherTransportCharges(double v) { this.otherTransportCharges = v; }

    public double getMiscellaneous() { return miscellaneous; }
    public void setMiscellaneous(double v) { this.miscellaneous = v; }

    public double getCrossingAmount() { return crossingAmount; }
    public void setCrossingAmount(double v) { this.crossingAmount = v; }

    public double getPodCharges() { return podCharges; }
    public void setPodCharges(double v) { this.podCharges = v; }

    public double getDoorDelivery() { return doorDelivery; }
    public void setDoorDelivery(double v) { this.doorDelivery = v; }

    public double getDoorPickup() { return doorPickup; }
    public void setDoorPickup(double v) { this.doorPickup = v; }

    public double getDdc() { return ddc; }
    public void setDdc(double v) { this.ddc = v; }

    public double getDcc() { return dcc; }
    public void setDcc(double v) { this.dcc = v; }

    public double getDemurrage() { return demurrage; }
    public void setDemurrage(double v) { this.demurrage = v; }

    public double getUnloading() { return unloading; }
    public void setUnloading(double v) { this.unloading = v; }

    public double getLocalVehicle() { return localVehicle; }
    public void setLocalVehicle(double v) { this.localVehicle = v; }

    public double getCrossingHire() { return crossingHire; }
    public void setCrossingHire(double v) { this.crossingHire = v; }

    public double getSgst() { return sgst; }
    public void setSgst(double v) { this.sgst = v; recalcGst(); }

    public double getCgst() { return cgst; }
    public void setCgst(double v) { this.cgst = v; recalcGst(); }

    public double getIgst() { return igst; }
    public void setIgst(double v) { this.igst = v; recalcGst(); }

    public double getGst() { return gst; }
    public void setGst(double v) { this.gst = v; }

    // chargesTotal = all non-freight, non-GST charges combined
    public double getChargesTotal() { return chargesTotal; }
    public void setChargesTotal(double v) { this.chargesTotal = v; }

    public double getTotal() { return total; }
    public void setTotal(double v) { this.total = v; }

    // Recomputes gst whenever any GST component changes
    private void recalcGst() { this.gst = this.sgst + this.cgst + this.igst; }
}
