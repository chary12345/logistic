package com.logic.logistic.model;

import java.time.LocalDateTime;

public class BookingDTO {

    private String consignorName;
    private String consignorMobile;
    private String consignorAddress;

    private String consigneeName;
    private String consigneeMobile;
    private String consigneeAddress;

    private String articleType;
    private int articleWeight;
    private double freight;
    private double sgst;
    private double cgst;
    private double igst;

    private LocalDateTime bookingDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime recieveDate;
    private LocalDateTime deliveryDate;

    private String companyCode;
    private String branchCode;
    private String consignStatus;
	public String getConsignorName() {
		return consignorName;
	}
	public void setConsignorName(String consignorName) {
		this.consignorName = consignorName;
	}
	public String getConsignorMobile() {
		return consignorMobile;
	}
	public void setConsignorMobile(String consignorMobile) {
		this.consignorMobile = consignorMobile;
	}
	public String getConsignorAddress() {
		return consignorAddress;
	}
	public void setConsignorAddress(String consignorAddress) {
		this.consignorAddress = consignorAddress;
	}
	public String getConsigneeName() {
		return consigneeName;
	}
	public void setConsigneeName(String consigneeName) {
		this.consigneeName = consigneeName;
	}
	public String getConsigneeMobile() {
		return consigneeMobile;
	}
	public void setConsigneeMobile(String consigneeMobile) {
		this.consigneeMobile = consigneeMobile;
	}
	public String getConsigneeAddress() {
		return consigneeAddress;
	}
	public void setConsigneeAddress(String consigneeAddress) {
		this.consigneeAddress = consigneeAddress;
	}
	public String getArticleType() {
		return articleType;
	}
	public void setArticleType(String articleType) {
		this.articleType = articleType;
	}
	public int getArticleWeight() {
		return articleWeight;
	}
	public void setArticleWeight(int articleWeight) {
		this.articleWeight = articleWeight;
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
	public LocalDateTime getBookingDate() {
		return bookingDate;
	}
	public void setBookingDate(LocalDateTime bookingDate) {
		this.bookingDate = bookingDate;
	}
	public LocalDateTime getDispatchDate() {
		return dispatchDate;
	}
	public void setDispatchDate(LocalDateTime dispatchDate) {
		this.dispatchDate = dispatchDate;
	}
	public LocalDateTime getRecieveDate() {
		return recieveDate;
	}
	public void setRecieveDate(LocalDateTime recieveDate) {
		this.recieveDate = recieveDate;
	}
	public LocalDateTime getDeliveryDate() {
		return deliveryDate;
	}
	public void setDeliveryDate(LocalDateTime deliveryDate) {
		this.deliveryDate = deliveryDate;
	}
	public String getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}
	public String getBranchCode() {
		return branchCode;
	}
	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}
	public String getConsignStatus() {
		return consignStatus;
	}
	public void setConsignStatus(String consignStatus) {
		this.consignStatus = consignStatus;
	}

    
}
