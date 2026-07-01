package com.logic.logistic.dto;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_charge_details")
public class BookingChargeDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loading_reciept")
    private String loadingReciept;

    @Column(name = "lr_charge")
    private double lrCharge;

    @Column(name = "hamali")
    private double hamali;

    @Column(name = "loading")
    private double loading;

    @Column(name = "stationary")
    private double stationary;

    @Column(name = "other_charges")
    private double otherCharges;

    @Column(name = "other_transport_charges")
    private double otherTransportCharges;

    @Column(name = "miscellaneous")
    private double miscellaneous;

    @Column(name = "crossing_amount")
    private double crossingAmount;

    @Column(name = "pod_charges")
    private double podCharges;

    @Column(name = "door_delivery")
    private double doorDelivery;

    @Column(name = "door_pickup")
    private double doorPickup;

    @Column(name = "ddc")
    private double ddc;

    @Column(name = "dcc")
    private double dcc;

    @Column(name = "demurrage")
    private double demurrage;

    @Column(name = "unloading")
    private double unloading;

    @Column(name = "local_vehicle")
    private double localVehicle;

    @Column(name = "crossing_hire")
    private double crossingHire;

    @Column(name = "freight")
    private double freight;

    @Column(name = "sgst")
    private double sgst;

    @Column(name = "cgst")
    private double cgst;

    @Column(name = "igst")
    private double igst;

    @Column(name = "loading_charge")
    private double loadingCharge;

    @Column(name = "total_amount")
    private double totalAmount;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLoadingReciept() {
        return loadingReciept;
    }

    public void setLoadingReciept(String loadingReciept) {
        this.loadingReciept = loadingReciept;
    }

    public double getLrCharge() {
        return lrCharge;
    }

    public void setLrCharge(double lrCharge) {
        this.lrCharge = lrCharge;
    }

    public double getHamali() {
        return hamali;
    }

    public void setHamali(double hamali) {
        this.hamali = hamali;
    }

    public double getLoading() {
        return loading;
    }

    public void setLoading(double loading) {
        this.loading = loading;
    }

    public double getStationary() {
        return stationary;
    }

    public void setStationary(double stationary) {
        this.stationary = stationary;
    }

    public double getOtherCharges() {
        return otherCharges;
    }

    public void setOtherCharges(double otherCharges) {
        this.otherCharges = otherCharges;
    }

    public double getOtherTransportCharges() {
        return otherTransportCharges;
    }

    public void setOtherTransportCharges(double otherTransportCharges) {
        this.otherTransportCharges = otherTransportCharges;
    }

    public double getMiscellaneous() {
        return miscellaneous;
    }

    public void setMiscellaneous(double miscellaneous) {
        this.miscellaneous = miscellaneous;
    }

    public double getCrossingAmount() {
        return crossingAmount;
    }

    public void setCrossingAmount(double crossingAmount) {
        this.crossingAmount = crossingAmount;
    }

    public double getPodCharges() {
        return podCharges;
    }

    public void setPodCharges(double podCharges) {
        this.podCharges = podCharges;
    }

    public double getDoorDelivery() {
        return doorDelivery;
    }

    public void setDoorDelivery(double doorDelivery) {
        this.doorDelivery = doorDelivery;
    }

    public double getDoorPickup() {
        return doorPickup;
    }

    public void setDoorPickup(double doorPickup) {
        this.doorPickup = doorPickup;
    }

    public double getDdc() {
        return ddc;
    }

    public void setDdc(double ddc) {
        this.ddc = ddc;
    }

    public double getDcc() {
        return dcc;
    }

    public void setDcc(double dcc) {
        this.dcc = dcc;
    }

    public double getDemurrage() {
        return demurrage;
    }

    public void setDemurrage(double demurrage) {
        this.demurrage = demurrage;
    }

    public double getUnloading() {
        return unloading;
    }

    public void setUnloading(double unloading) {
        this.unloading = unloading;
    }

    public double getLocalVehicle() {
        return localVehicle;
    }

    public void setLocalVehicle(double localVehicle) {
        this.localVehicle = localVehicle;
    }

    public double getCrossingHire() {
        return crossingHire;
    }

    public void setCrossingHire(double crossingHire) {
        this.crossingHire = crossingHire;
    }

    public double getFreight() {
        return freight;
    }

    public void setFreight(double freight) {
        this.freight = freight;
    }

    public double getSgst() {
        return sgst;
    }

    public void setSgst(double sgst) {
        this.sgst = sgst;
    }

    public double getCgst() {
        return cgst;
    }

    public void setCgst(double cgst) {
        this.cgst = cgst;
    }

    public double getIgst() {
        return igst;
    }

    public void setIgst(double igst) {
        this.igst = igst;
    }

    public double getLoadingCharge() {
        return loadingCharge;
    }

    public void setLoadingCharge(double loadingCharge) {
        this.loadingCharge = loadingCharge;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }
}