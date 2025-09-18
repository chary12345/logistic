package com.logic.logistic.model;

import java.time.LocalDateTime;
import java.util.List;

public class BookingDTO {

	private String loadingReciept;
    private String consignorName;
    private String consignorMobile;
    private String consignorAddress;

    private String consigneeName;
    private String consigneeMobile;
    private String consigneeAddress;

    private List<ArticleDetail> articleDetails;
  
    private double freight;
    private double sgst;
    private double cgst;
    private double igst;
    private double loading;
    private double loadingCharge;

    private LocalDateTime bookingDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime recieveDate;
    private LocalDateTime deliveryDate;

    private String companyCode;
    private String branchCode;
    private String destinationBranchCode;
    private String consignStatus;
    private String billType;
    private String invoiceNumber;
    private Double  invoiceValue;
    private String eWayBillNumber;
    private String employeeName;
    private String paidVia;
    
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
	public String getBillType() {
		return billType;
	}
	public void setBillType(String billType) {
		this.billType = billType;
	}
	public String getInvoiceNumber() {
		return invoiceNumber;
	}
	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}
	
	public Double getInvoiceValue() {
		return invoiceValue;
	}
	public void setInvoiceValue(Double invoiceValue) {
		this.invoiceValue = invoiceValue;
	}
	public String geteWayBillNumber() {
		return eWayBillNumber;
	}
	public void seteWayBillNumber(String eWayBillNumber) {
		this.eWayBillNumber = eWayBillNumber;
	}
	public String getDestinationBranchCode() {
		return destinationBranchCode;
	}
	public void setDestinationBranchCode(String destinationBranchCode) {
		this.destinationBranchCode = destinationBranchCode;
	}
	public List<ArticleDetail> getArticleDetails() {
		return articleDetails;
	}
	public void setArticleDetails(List<ArticleDetail> articleDetails) {
		this.articleDetails = articleDetails;
	}
	public String getLoadingReciept() {
		return loadingReciept;
	}
	public void setLoadingReciept(String loadingReciept) {
		this.loadingReciept = loadingReciept;
	}
	public String getEmployeeName() {
		return employeeName;
	}
	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}
	public double getLoading() {
		return loading;
	}
	public void setLoading(double loading) {
		this.loading = loading;
	}
	public double getLoadingCharge() {
		return loadingCharge;
	}
	public void setLoadingCharge(double loadingCharge) {
		this.loadingCharge = loadingCharge;
	}
	public String getPaidVia() {
		return paidVia;
	}
	public void setPaidVia(String paidVia) {
		this.paidVia = paidVia;
	}
	

    
}
