package com.logic.logistic.model;

import java.time.LocalDateTime;
import java.util.List;

public class BookingDTO {

	private String loadingReciept;
    private String consignorName;
    private String consignorMobile;
    private String consignorAddress;
    private String consignorGST;

    private String consigneeName;
    private String consigneeMobile;
    private String consigneeAddress;
    private String consigneeGST;

    private List<ArticleDetail> articleDetails;

	private double lrCharge;

	private double hamali;

	private double loading;

	private double stationary;

	private double otherCharges;

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

	private double freight;

	private double sgst;

	private double cgst;

	private double igst;

	private double loadingCharge;

	private double totalAmount;

    private LocalDateTime bookingDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime recieveDate;
    private LocalDateTime deliveryDate;

    private String companyCode;
    private String branchCode;  //sending branch
    private String destinationBranchCode;
    private String consignStatus;
    private String billType;
    private String invoiceNumber;
    private Double  invoiceValue;
    private String eWayBillNumber;
    private String employeeName;
    private String paidVia;
	private String partyName;
	private String remarks;
	private List<String> eWayBillNumbers;
	private String gstPaidBy;
	private String deliveryType;

    
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
	public String getConsignorGST() {
		return consignorGST;
	}
	public void setConsignorGST(String consignorGST) {
		this.consignorGST = consignorGST;
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
	public String getConsigneeGST() {
		return consigneeGST;
	}
	public void setConsigneeGST(String consigneeGST) {
		this.consigneeGST = consigneeGST;
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

	public String getPartyName() {
		return partyName;
	}

	public void setPartyName(String partyName) {
		this.partyName = partyName;
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

	public double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public List<String> geteWayBillNumbers() {
		return eWayBillNumbers;
	}

	public void seteWayBillNumbers(List<String> eWayBillNumbers) {
		this.eWayBillNumbers = eWayBillNumbers;
	}

	public String getGstPaidBy() {
		return gstPaidBy;
	}

	public void setGstPaidBy(String gstPaidBy) {
		this.gstPaidBy = gstPaidBy;
	}

	public String getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(String deliveryType) {
		this.deliveryType = deliveryType;
	}
}
